/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.khanhdz_core.function;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@FunctionalInterface
public interface QuadConsumer<T, U, V, W> {

    void accept(T t, U u, V v, W w);

    default QuadConsumer<T, U, V, W> andThen(QuadConsumer<? super T, ? super U, ? super V, ? super W> after) {
        return (t, u, v, w) -> {
            accept(t, u, v, w);
            after.accept(t, u, v, w);
        };
    }
}
