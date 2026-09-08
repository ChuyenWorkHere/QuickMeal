/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.collection;

import com.khanhdz_core.util.Logger;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 * @param <K>
 * @param <V>
 */
public class KhanhDzLinkedHashMapReadWriteLock<K, V> {

    // Danh sách các đối tượng được bảo vệ bởi ReadWriteLock
    private final LinkedHashMap<K, V> objects;

    // ReadWriteLock để đồng bộ hóa truy cập
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public KhanhDzLinkedHashMapReadWriteLock() {
        objects = new LinkedHashMap<>();
    }

    public KhanhDzLinkedHashMapReadWriteLock(int MAX_SIZE) {
        if (MAX_SIZE < 0) {
            Logger.fatal("Lồn gì vậy ? " + MAX_SIZE);
        }
        objects = new LinkedHashMap<>() {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return this.size() > MAX_SIZE;
            }

        };
    }

    public boolean isEmpty() {
        try {
            lock.readLock().lock();
            return objects.isEmpty();
        } finally {
            lock.readLock().unlock();
        }
    }

    // Lấy kích thước của danh sách
    public int size() {
        try {
            lock.readLock().lock();
            return objects.size();
        } finally {
            lock.readLock().unlock();
        }
    }

    public V get(K k) {
        try {
            lock.readLock().lock();
            return objects.get(k);
        } finally {
            lock.readLock().unlock();
        }
    }

    public V getOrDefault(K k, V defaultValue) {
        try {
            lock.readLock().lock();
            return objects.getOrDefault(k, defaultValue);
        } finally {
            lock.readLock().unlock();
        }
    }

    public V put(K k, V v) {
        try {
            lock.writeLock().lock();
            return this.objects.put(k, v);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public V putLast(K k, V v) {
        try {
            lock.writeLock().lock();
            return this.objects.putLast(k, v);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public boolean remove(K k, V v) {
        try {
            lock.writeLock().lock();
            return this.objects.remove(k, v);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public V remove(K k) {
        try {
            lock.writeLock().lock();
            return this.objects.remove(k);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public LinkedHashMap<K, V> startRead() {
        lock.readLock().lock();
        return objects;
    }

    public void doneRead() {
        lock.readLock().unlock();
    }

    public LinkedHashMap<K, V> startWrite() {
        lock.writeLock().lock();
        return objects;
    }

    public void doneWrite() {
        lock.writeLock().unlock();
    }

    public void clear() {
        try {
            lock.writeLock().lock();
            this.objects.clear();
        } finally {
            lock.writeLock().unlock();
        }
    }

}
