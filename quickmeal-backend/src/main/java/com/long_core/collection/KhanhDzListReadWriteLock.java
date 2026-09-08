/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.collection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Consumer;
import java.util.function.Predicate;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 * @param <T>
 */
public class KhanhDzListReadWriteLock<T> {

    // Danh sách các đối tượng được bảo vệ bởi ReadWriteLock
    private List<T> listObject = new ArrayList<>();

    // ReadWriteLock để đồng bộ hóa truy cập
    private ReadWriteLock lockList = new ReentrantReadWriteLock();

    public boolean isEmpty() {
        try {
            lockList.readLock().lock();
            return listObject.isEmpty();
        } finally {
            lockList.readLock().unlock();
        }
    }

    public void foreach(Consumer<? super T> action) {
        try {
            lockList.readLock().lock();
            listObject.forEach(action);
        } finally {
            lockList.readLock().unlock();
        }
    }

    // Lấy kích thước của danh sách
    public int size() {
        try {
            lockList.readLock().lock();
            return listObject.size();
        } finally {
            lockList.readLock().unlock();
        }
    }

    // Thêm một đối tượng vào danh sách
    public boolean add(T object) {
        try {
            lockList.writeLock().lock();
            return listObject.add(object);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    public boolean addIfNotContain(T object) {
        try {
            lockList.writeLock().lock();
            if (listObject.contains(object)) {
                return false;
            }
            return listObject.add(object);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    public T set(int index, T object) {
        try {
            lockList.writeLock().lock();
            return listObject.set(index, object);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Thêm nhiều đối tượng vào danh sách bằng danh sách List
    public boolean add(List<T> objects) {
        try {
            lockList.writeLock().lock();
            return listObject.addAll(objects);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Thêm nhiều đối tượng vào danh sách bằng mảng
    public boolean add(T... objects) {
        try {
            lockList.writeLock().lock();
            return listObject.addAll(Arrays.asList(objects));
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Xóa một đối tượng khỏi danh sách
    public T removeByIndex(int index) {
        try {
            lockList.writeLock().lock();
            return listObject.remove(index);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    public boolean remove(T object) {
        try {
            lockList.writeLock().lock();
            return listObject.remove(object);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Xóa nhiều đối tượng khỏi danh sách bằng danh sách List
    public boolean remove(List<T> objects) {
        try {
            lockList.writeLock().lock();
            return listObject.removeAll(objects);
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Xóa nhiều đối tượng khỏi danh sách bằng danh sách List
    public boolean remove(T... objects) {
        try {
            lockList.writeLock().lock();
            return listObject.removeAll(Arrays.asList(objects));
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Lấy đối tượng tại vị trí index
    public T get(int index) {
        try {
            lockList.readLock().lock();
            return listObject.get(index);
        } finally {
            lockList.readLock().unlock();
        }
    }

    public T get(int index, T defaultValue) {
        try {
            lockList.readLock().lock();
            return listObject.get(index);
        } catch (Exception e) {
            return defaultValue;
        } finally {
            lockList.readLock().unlock();
        }
    }

    // Xóa tất cả các đối tượng trong danh sách
    public void clear() {
        try {
            lockList.writeLock().lock();
            listObject.clear();
        } finally {
            lockList.writeLock().unlock();
        }
    }

    // Kiểm tra xem danh sách có chứa đối tượng không
    public boolean contains(T object) {
        try {
            lockList.readLock().lock();
            return listObject.contains(object);
        } finally {
            lockList.readLock().unlock();
        }
    }

    public List<T> startRead() {
        lockList.readLock().lock();
        return listObject;
    }

    public void doneRead() {
        lockList.readLock().unlock();
    }

    public List<T> startWrite() {
        lockList.writeLock().lock();
        return listObject;
    }

    public void doneWrite() {
        lockList.writeLock().unlock();
    }

    public T getRandom() throws Exception {
        try {
            // Khóa đọc để tránh các thay đổi trong danh sách khi đọc
            lockList.readLock().lock();

            // Kiểm tra danh sách có phần tử hay không
            if (listObject.isEmpty()) {
                return null;
            }

            // Sinh ra một chỉ số ngẫu nhiên trong danh sách
            int randomIndex = ThreadLocalRandom.current().nextInt(listObject.size());

            // Trả về phần tử tại chỉ số ngẫu nhiên
            return listObject.get(randomIndex);
        } catch (Exception e) {
            throw e;
        } finally {
            // Giải phóng khóa đọc
            lockList.readLock().unlock();
        }
    }

    public boolean allMatch(Predicate<? super T> predicate) {
        try {
            // Khóa đọc để tránh các thay đổi trong danh sách khi đọc
            lockList.readLock().lock();
            return listObject.stream().allMatch(predicate);
        } catch (Exception e) {
            throw e;
        } finally {
            // Giải phóng khóa đọc
            lockList.readLock().unlock();
        }
    }

    public T fintObjectByLogic(Predicate< T> logicFind) throws Exception {
        try {
            var entrySet = this.startRead();
            for (var v : entrySet) {
                if (logicFind.test(v)) {
                    return v;
                }
            }
        } catch (Exception e) {
            throw e;
        } finally {
            this.doneRead();
        }
        return null;
    }

}
