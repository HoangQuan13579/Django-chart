import pandas as pd
from django.core.management.base import BaseCommand
from myapp.models import CustomerSegment, Customer, ProductGroup, Product, Order, OrderItem
from django.utils.dateparse import parse_datetime

class Command(BaseCommand):
    help = "Import dữ liệu từ CSV vào database"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str, help="Đường dẫn tới file CSV")

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        df = pd.read_csv(csv_file)

        for _, row in df.iterrows():
            # 1️⃣ CustomerSegment
            segment, _ = CustomerSegment.objects.get_or_create(
                code=row["Mã PKKH"],
                defaults={"description": row["Mô tả Phân Khúc Khách hàng"]}
            )

            # 2️⃣ Customer
            customer, _ = Customer.objects.get_or_create(
                code=row["Mã khách hàng"],
                defaults={
                    "name": row["Tên khách hàng"],
                    "segment": segment
                }
            )

            # 3️⃣ ProductGroup
            group, _ = ProductGroup.objects.get_or_create(
                code=row["Mã nhóm hàng"],
                defaults={"name": row["Tên nhóm hàng"]}
            )

            # 4️⃣ Product
            product, _ = Product.objects.get_or_create(
                code=row["Mã mặt hàng"],
                defaults={
                    "name": row["Tên mặt hàng"],
                    "group": group,
                    "cost_price": row["Giá Nhập"]
                }
            )

            # 5️⃣ Order
            order, _ = Order.objects.get_or_create(
                order_code=row["Mã đơn hàng"],
                defaults={
                    "customer": customer,
                    "created_at": parse_datetime(row["Thời gian tạo đơn"])
                }
            )

            # 6️⃣ OrderItem
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=row["SL"],
                unit_price=row["Đơn giá"],
                total_price=row["Thành tiền"]
            )

        self.stdout.write(self.style.SUCCESS("✅ Import CSV thành công!"))
