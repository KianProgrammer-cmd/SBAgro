from django.urls import path

from .views import (
    PlatformStatsView,
    SalesSummaryView,
    OrderStatusReportView,
    ProvinceReportView,
    FullReportView,
)


urlpatterns = [
    path(
        "platform-stats/",
        PlatformStatsView.as_view(),
        name="platform-stats",
    ),

    path(
        "sales-summary/",
        SalesSummaryView.as_view(),
        name="sales-summary",
    ),

    path(
        "order-statuses/",
        OrderStatusReportView.as_view(),
        name="order-statuses",
    ),

    path(
        "province-report/",
        ProvinceReportView.as_view(),
        name="province-report",
    ),

    path(
        "full-report/",
        FullReportView.as_view(),
        name="full-report",
    ),
]