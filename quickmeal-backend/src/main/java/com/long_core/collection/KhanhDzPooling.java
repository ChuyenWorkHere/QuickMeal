/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.collection;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 * @param <T>
 */
public class KhanhDzPooling<T> {

    // Queue để lưu trữ các đối tượng trong pool
    private final ConcurrentLinkedQueue<T> pool = new ConcurrentLinkedQueue<>();

    // Logic để tạo đối tượng mới
    private final Supplier<T> logicCreateObject;

    // Logic để hoàn trả đối tượng
    private final Consumer<T> logicReturnObject;

    /**
     * Constructor để khởi tạo pool.
     *
     * @param logicCreateObject logic tạo đối tượng
     * @param logicReturnObject logic hoàn trả đối tượng
     */
    public KhanhDzPooling(Supplier<T> logicCreateObject, Consumer<T> logicReturnObject) {
        this.logicCreateObject = logicCreateObject;
        this.logicReturnObject = logicReturnObject;
    }

    /**
     * Lend một đối tượng từ pool.
     *
     * @return đối tượng được cho mượn
     */
    public T lendObject() {
        // Kiểm tra xem pool có đối tượng nào không
        if (this.pool.poll() instanceof T object) {
            return object;
        }
        // Nếu không có, tạo một đối tượng mới
        return logicCreateObject.get();
    }

    /**
     * Trả lại đối tượng về pool.
     *
     * @param object đối tượng cần trả
     */
    public void returnObject(T object) {
        if (object == null) {
            return;
        }
        // Sử dụng executor để hoàn trả đối tượng
        Thread.startVirtualThread(() -> {
            logicReturnObject.accept(object);
            // Thêm đối tượng vào pool để tái sử dụng
            pool.offer(object);

        });
    }

    public int sizePool() {
        return pool.size();
    }

}
