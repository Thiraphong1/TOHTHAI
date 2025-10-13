import React, { useEffect, useState, useCallback } from 'react';
import useEcomStore from '../../store/ecomStore';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FiSearch } from 'react-icons/fi';

const SearchCard = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const actionSearchFilters = useEcomStore((state) => state.actionSearchFilters);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);

  const [text, setText] = useState('');
  const [categorySelect, setCategorySelect] = useState([]);
  const [price, setPrice] = useState([0, 1000]);
  
  // ใช้ useCallback เพื่อให้ getCategory ไมเปลี่ยน reference ทุกครั้งที่ re-render
  const memoizedGetCategory = useCallback(getCategory, []);

  useEffect(() => {
    memoizedGetCategory();
  }, [memoizedGetCategory]);

  // Debounced search for text input - ทำงานเมื่อ text เปลี่ยนเท่านั้น
  useEffect(() => {
    const delay = setTimeout(() => {
      actionSearchFilters({ query: text });
    }, 400);
    return () => clearTimeout(delay);
  }, [text, actionSearchFilters]);

  const handleCheck = (e) => {
    const categoryId = e.target.value; // ค่าที่ได้จะเป็น String
    const updatedCategories = [...categorySelect];
    const foundIndex = updatedCategories.indexOf(categoryId);

    if (foundIndex === -1) {
      updatedCategories.push(categoryId);
    } else {
      updatedCategories.splice(foundIndex, 1);
    }
    setCategorySelect(updatedCategories);
    actionSearchFilters({ category: updatedCategories });
  };
  
  const handlePriceAfterChange = (value) => {
    actionSearchFilters({ price: value });
  };
  
  const handleResetFilters = () => {
    setText('');
    setCategorySelect([]);
    setPrice([0, 1000]);
    // ส่งค่าว่างกลับไปที่ store เพื่อล้างค่า
    actionSearchFilters({ query: '', category: [], price: [0, 1000] });
    // getProduct() ควรถูกเรียกภายใน store เมื่อ filter เป็นค่าว่าง
    // หรือถ้าจำเป็นต้องเรียกตรงนี้ก็ได้
    getProduct();
  };

  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200'>
      <div className='mb-6'>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>ค้นหาเมนู</h2>
        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            className='border border-gray-300 rounded-lg w-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            placeholder='ค้นหา...'
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      <div className='mb-6'>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>หมวดหมู่</h2>
        <div className='space-y-2 max-h-48 overflow-y-auto pr-2'>
          {categories.map((item) => (
            <label key={item.id} className='flex items-center gap-3 cursor-pointer hover:text-blue-600 transition'>
              <input
                type="checkbox"
                onChange={handleCheck}
                value={item.id} // value จะถูกแปลงเป็น string อัตโนมัติ
                checked={categorySelect.includes(String(item.id))} // **แก้ไขจุดนี้** ทำให้แน่ใจว่าเปรียบเทียบ string กับ string
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className='select-none'>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>ช่วงราคา</h2>
        <div className='text-center font-mono text-gray-700 text-lg mb-4'>
          <span>฿{price[0]}</span>
          <span className='mx-2'>-</span>
          <span>฿{price[1]}</span>
        </div>
        <Slider
          range
          min={0}
          max={1000}
          value={price}
          onChange={setPrice}
          onAfterChange={handlePriceAfterChange}
          trackStyle={[{ backgroundColor: '#2563eb' }]}
          handleStyle={[
            { borderColor: '#2563eb', backgroundColor: 'white', borderWidth: 2 },
            { borderColor: '#2563eb', backgroundColor: 'white', borderWidth: 2 }
          ]}
          railStyle={{ backgroundColor: '#e5e7eb' }}
        />
      </div>

      <button 
        onClick={handleResetFilters}
        className='w-full bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
      >
        ล้างการค้นหา
      </button>
    </div>
  );
};

export default SearchCard;