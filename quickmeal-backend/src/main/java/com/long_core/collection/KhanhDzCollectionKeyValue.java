/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.collection;

import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class KhanhDzCollectionKeyValue {

    private final Map collection = new HashMap<>();

    public final void clear() {
        collection.clear();
    }

    public final Object get(Object key) {
        return collection.getOrDefault(key, null);
    }

    public final Object put(Object key, Object value) {
        return collection.put(key, value);
    }

    public final Object remove(Object key) {
        return collection.remove(key);
    }

    public int getInt(Object key, int defaultValue) {
        if (this.get(key) instanceof Integer value) {
            return value;
        }
        return defaultValue;
    }

    public Integer getIntegerObject(Object key, Integer defaultValue) {
        if (this.get(key) instanceof Integer value) {
            return value;
        }
        return defaultValue;
    }

    public long getLong(Object key, long defaultValue) {
        if (this.get(key) instanceof Long value) {
            return value;
        }
        return defaultValue;
    }

    public Long getLongObject(Object key, Long defaultValue) {
        if (this.get(key) instanceof Long value) {
            return value;
        }
        return defaultValue;
    }

    public boolean getBoolean(Object key, boolean defaultValue) {
        if (this.get(key) instanceof Boolean value) {
            return value;
        }
        return defaultValue;
    }

    public String getString(Object key, String defaultValue) {
        if (this.get(key) instanceof String value) {
            return value;
        }
        return defaultValue;
    }

}
