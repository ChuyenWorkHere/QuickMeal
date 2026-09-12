package com.quickmeal.backend.job;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.constant.PaymentMethod;
import com.quickmeal.backend.constant.PaymentStatus;
import com.quickmeal.backend.repo.OrderRepository;
import com.quickmeal.backend.service.VNPayService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Lưới an toàn cho 2 tình huống: (1) khách bỏ ngang không thanh toán, không có phản hồi gì
 * cả, và (2) khách đã thanh toán thành công nhưng IPN bị rớt không tới được server.
 *
 * Chỉ quét các đơn VNPAY còn UNPAID và đã tồn tại quá GRACE_PERIOD (đơn mới tạo chưa cần
 * hỏi ngay, thanh toán bình thường xong trong vài chục giây). Với IPN hoạt động tốt ở
 * production, tập kết quả mỗi lần chạy gần như luôn rỗng - job chỉ là dự phòng, không phải
 * cơ chế chính, nên chi phí trung bình rất thấp.
 */
@Component
@RequiredArgsConstructor
public class PaymentReconciliationJob {

    private static final long GRACE_PERIOD_MINUTES = 2;

    private final OrderRepository orderRepository;
    private final VNPayService vnPayService;

    @Scheduled(fixedDelay = 3 * 60 * 1000) // mỗi 3 phút
    public void reconcilePendingPayments() {
        final var graceThreshold = LocalDateTime.now().minusMinutes(GRACE_PERIOD_MINUTES);
        final var pendingOrders = orderRepository.findByPaymentMethodAndPaymentStatusAndCreatedAtBefore(
                PaymentMethod.VNPAY, PaymentStatus.UNPAID, graceThreshold);

        for (var order : pendingOrders) {
            try {
                vnPayService.reconcile(order);
            } catch (Exception e) {
                Logger.error("Lỗi reconcile thanh toán cho đơn #" + order.getId(), e);
            }
        }
    }
}
