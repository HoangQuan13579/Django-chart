from django.urls import path
from . import views

urlpatterns = [
    path('', views.chart, name='home'),   # 👈 thêm dòng này
    path('chart/', views.chart, name='chart1'),
]
