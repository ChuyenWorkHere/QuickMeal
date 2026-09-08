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
public interface PentaConsumer<T, U, V, W, X> {

    void accept(T t, U u, V v, W w, X x);

    default PentaConsumer<T, U, V, W, X> andThen(PentaConsumer<? super T, ? super U, ? super V, ? super W, ? super X> after) {
        return (t, u, v, w, x) -> {
            accept(t, u, v, w, x);
            after.accept(t, u, v, w, x);
        };
    }
}
