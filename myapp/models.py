from django.db import models

# 1️⃣ Bảng phân khúc khách hàng
class CustomerSegment(models.Model):
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.description


# 2️⃣ Bảng khách hàng
class Customer(models.Model):
    code = models.CharField(max_length=20, unique=True)  # Mã khách hàng
    name = models.CharField(max_length=100)
    segment = models.ForeignKey(CustomerSegment, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


# 3️⃣ Bảng nhóm hàng
class ProductGroup(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 4️⃣ Bảng mặt hàng
class Product(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


# 5️⃣ Bảng đơn hàng
class Order(models.Model):
    order_code = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    created_at = models.DateTimeField()

    def __str__(self):
        return self.order_code


# 6️⃣ Bảng chi tiết đơn hàng
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.order.order_code} - {self.product.name}"
