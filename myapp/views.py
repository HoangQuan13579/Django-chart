import json
import statistics
import math
from collections import defaultdict
from django.shortcuts import render
from django.db.models import Sum
from django.db.models.functions import TruncDate, ExtractMonth, TruncHour
from django.utils.safestring import mark_safe
from .models import OrderItem


def chart(request):
    # ---------- Chart 1 & 2 : dữ liệu mặt hàng ----------
    qs_items = (
        OrderItem.objects
        .values(
            'product__code',
            'product__name',
            'product__group__code',
            'product__group__name'
        )
        .annotate(
            total_sales=Sum('total_price'),
            total_qty=Sum('quantity')
        )
        .order_by('-total_sales')[:50]
    )
    data = [
        {
            "code": q["product__code"],
            "name": q["product__name"],
            "group_code": q["product__group__code"],
            "group_name": q["product__group__name"],
            "total_sales": float(q["total_sales"] or 0),
            "total_qty": int(q["total_qty"] or 0),
        }
        for q in qs_items
    ]

    # ---------- Chart 3 : dữ liệu theo tháng ----------
    qs_month = (
        OrderItem.objects
        .annotate(month=ExtractMonth("order__created_at"))
        .values("month")
        .annotate(
            total_sales=Sum("total_price"),
            total_qty=Sum("quantity")
        )
        .order_by("month")
    )
    chart3_data = list(qs_month)

    # ---------- Chart 4 : trung bình theo ngày trong tuần ----------
    daily = (
        OrderItem.objects
        .annotate(day=TruncDate("order__created_at"))
        .values("day")
        .annotate(
            day_sales=Sum("total_price"),
            day_qty=Sum("quantity"),
        )
    )

    weekday_sales = defaultdict(list)
    weekday_qty = defaultdict(list)

    for row in daily:
        weekday = row["day"].weekday()  # Monday=0 ... Sunday=6
        weekday_sales[weekday].append(row["day_sales"])
        weekday_qty[weekday].append(row["day_qty"])

    weekday_map = ["Thứ Hai", "Thứ Ba", "Thứ Tư",
                   "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]

    chart4_data = []
    for wd in range(7):
        if weekday_sales[wd]:
            chart4_data.append({
                "day": weekday_map[wd],
                "avgValue": statistics.mean(weekday_sales[wd]) / 1_000_000,
                "avgQty": statistics.mean(weekday_qty[wd]),
            })

    # ---------- Chart 5 : trung bình theo ngày trong tháng ----------
    dom_sales = defaultdict(list)
    dom_qty = defaultdict(list)

    for row in daily:
        dom = row["day"].day  # 1–31
        dom_sales[dom].append(row["day_sales"])
        dom_qty[dom].append(row["day_qty"])

    chart5_data = []
    for d in range(1, 32):
        if dom_sales[d]:
            chart5_data.append({
                "day": f"Ngày {d:02d}",
                "avgValue": statistics.mean(dom_sales[d]) / 1_000_000,
                "avgQty": statistics.mean(dom_qty[d]),
            })

    # ---------- Chart 6 : trung bình theo giờ ----------
    hourly = (
        OrderItem.objects
        .annotate(day=TruncDate("order__created_at"), hour=TruncHour("order__created_at"))
        .values("day", "hour")
        .annotate(
            day_sales=Sum("total_price"),
            day_qty=Sum("quantity"),
        )
    )

    hour_sales = defaultdict(list)
    hour_qty = defaultdict(list)

    for row in hourly:
        hour = row["hour"].hour  # 0-23
        hour_sales[hour].append(row["day_sales"])
        hour_qty[hour].append(row["day_qty"])

    chart6_data = []
    for h in range(24):
        if hour_sales[h]:
            chart6_data.append({
                "hour": h,
                "range": f"{h:02d}:00 - {h:02d}:59",
                "avgValue": statistics.mean(hour_sales[h]),
                "avgQty": statistics.mean(hour_qty[h]),
            })

    chart6_data.sort(key=lambda x: x["hour"])

    # ---------- Chart 7 : Xác suất mua theo nhóm hàng ----------
    qs_orders = (
        OrderItem.objects
        .values("product__group__code", "product__group__name", "order__order_code")
        .distinct()
    )

    group_orders = defaultdict(set)
    for row in qs_orders:
        group = f"[{row['product__group__code']}] {row['product__group__name']}"
        group_orders[group].add(row["order__order_code"])

    total_orders = len({r["order__order_code"] for r in qs_orders})

    chart7_data = []
    for group, orders in group_orders.items():
        chart7_data.append({
            "group": group,
            "orders": len(orders),
            "prob": len(orders) / total_orders if total_orders else 0
        })
    chart7_data.sort(key=lambda x: -x["prob"])

    # ---------- Chart 8 : Xác suất theo tháng & nhóm ----------
    qs_orders_month = (
        OrderItem.objects
        .annotate(month=ExtractMonth("order__created_at"))
        .values("month", "product__group__code", "product__group__name", "order__order_code")
        .distinct()
    )

    month_group_orders = defaultdict(lambda: defaultdict(set))
    month_total_orders = defaultdict(set)

    for row in qs_orders_month:
        m = row["month"]
        group = f"[{row['product__group__code']}] {row['product__group__name']}"
        order = row["order__order_code"]
        month_group_orders[m][group].add(order)
        month_total_orders[m].add(order)

    chart8_data = []
    for m in sorted(month_total_orders.keys()):
        total = len(month_total_orders[m])
        for group, orders in month_group_orders[m].items():
            chart8_data.append({
                "month": m,
                "month_label": f"Tháng {m:02d}",
                "group": group,
                "orders": len(orders),
                "prob": len(orders) / total if total else 0
            })

    # ---------- Chart 9 : Xác suất theo nhóm & mặt hàng ----------
    qs = (
        OrderItem.objects
        .values(
            "order__order_code",
            "product__group__code", "product__group__name",
            "product__code", "product__name"
        )
        .distinct()
    )

    group_orders = defaultdict(set)
    item_orders = defaultdict(lambda: defaultdict(set))

    for row in qs:
        group = f"[{row['product__group__code']}] {row['product__group__name']}"
        item = f"[{row['product__code']}] {row['product__name']}"
        order = row["order__order_code"]
        group_orders[group].add(order)
        item_orders[group][item].add(order)

    chart9_data = []
    for group, items in item_orders.items():
        total_group = len(group_orders[group]) or 1
        for item, orders in items.items():
            count = len(orders)
            prob = count / total_group
            chart9_data.append({
                "group": group,
                "item": item,
                "count": count,
                "prob": prob
            })

    # ---------- Chart 10 : Xác suất theo tháng & mặt hàng ----------
    qs = (
        OrderItem.objects
        .annotate(month=ExtractMonth("order__created_at"))
        .values(
            "month",
            "order__order_code",
            "product__group__code", "product__group__name",
            "product__code", "product__name"
        )
        .distinct()
    )

    month_group_orders = defaultdict(lambda: defaultdict(set))
    month_item_orders = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))

    for row in qs:
        m = row["month"]
        group = f"[{row['product__group__code']}] {row['product__group__name']}"
        item = f"[{row['product__code']}] {row['product__name']}"
        order = row["order__order_code"]

        month_group_orders[m][group].add(order)
        month_item_orders[m][group][item].add(order)

    chart10_data = []
    for m, groups in month_group_orders.items():
        for group, orders in groups.items():
            total_group = len(orders) or 1
            for item, item_orders in month_item_orders[m][group].items():
                count = len(item_orders)
                prob = count / total_group
                chart10_data.append({
                    "month": m,
                    "month_label": f"Tháng {m:02d}",
                    "group": group,
                    "item": item,
                    "count": count,
                    "denom": total_group,
                    "prob": prob
                })

    # ---------- Chart 11 : Phân phối lượt mua ----------
    customer_orders = (
        OrderItem.objects
        .values("order__order_code", "order__customer__code")
        .distinct()
    )

    cust_order_count = defaultdict(set)
    for row in customer_orders:
        cust = row["order__customer__code"]
        order = row["order__order_code"]
        cust_order_count[cust].add(order)

    order_freq = [len(orders) for orders in cust_order_count.values()]

    freq_dist = defaultdict(int)
    for f in order_freq:
        freq_dist[f] += 1

    chart11_data = [
        {"times": times, "customers": cnt}
        for times, cnt in sorted(freq_dist.items())
    ]

    # ---------- Chart 12 : Phân phối mức chi trả ----------
    cust_spend = (
        OrderItem.objects
        .values("order__customer__code")
        .annotate(spend=Sum("total_price"))
    )

    bin_size = 50000
    bins = defaultdict(int)

    for row in cust_spend:
        spend = float(row["spend"] or 0)
        bin_index = math.floor(spend / bin_size)
        lower = bin_index * bin_size
        upper = (bin_index + 1) * bin_size
        bins[(lower, upper)] += 1

    chart122_data = []
    for (lower, upper), cnt in sorted(bins.items()):
        chart122_data.append({
            "lower": int(lower),
            "upper": int(upper),
            "customers": int(cnt),
            "label": f"Từ {lower/1000:.0f}K đến {upper/1000:.0f}K"
        })

    return render(
        request,
        "myapp/chart.html",
        {
            "data": mark_safe(json.dumps(data, default=float)),
            "chart3_data": mark_safe(json.dumps(chart3_data, default=float)),
            "chart4_data": mark_safe(json.dumps(chart4_data, default=float)),
            "chart5_data": mark_safe(json.dumps(chart5_data, default=float)),
            "chart6_data": mark_safe(json.dumps(chart6_data, default=float)),
            "chart7_data": mark_safe(json.dumps(chart7_data, default=float)),
            "chart8_data": mark_safe(json.dumps(chart8_data, default=float)),
            "chart9_data": mark_safe(json.dumps(chart9_data, default=float)),
            "chart10_data": mark_safe(json.dumps(chart10_data, default=float)),
            "chart11_data": mark_safe(json.dumps(chart11_data, default=float)),
            "chart122_data": mark_safe(json.dumps(chart122_data, ensure_ascii=False, default=float)),
        }
    )
