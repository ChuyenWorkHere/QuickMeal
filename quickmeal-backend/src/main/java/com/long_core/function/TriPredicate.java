/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.function;

import java.util.Objects;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@FunctionalInterface
public interface TriPredicate<T, U, V> {

    /**
     * Kiểm tra điều kiện với 3 tham số.
     *
     * @param t tham số thứ nhất
     * @param u tham số thứ hai
     * @param v tham số thứ ba
     * @return true/false tùy điều kiện
     */
    boolean test(T t, U u, V v);

    /**
     * Kết hợp với 1 TriPredicate khác theo kiểu AND.
     */
    default TriPredicate<T, U, V> and(TriPredicate<? super T, ? super U, ? super V> other) {
        Objects.requireNonNull(other);
        return (t, u, v) -> this.test(t, u, v) && other.test(t, u, v);
    }

    /**
     * Kết hợp với 1 TriPredicate khác theo kiểu OR.
     */
    default TriPredicate<T, U, V> or(TriPredicate<? super T, ? super U, ? super V> other) {
        Objects.requireNonNull(other);
        return (t, u, v) -> this.test(t, u, v) || other.test(t, u, v);
    }

    /**
     * Phủ định điều kiện.
     */
    default TriPredicate<T, U, V> negate() {
        return (t, u, v) -> !this.test(t, u, v);
    }
}
