import React from 'react'
import { useState, useEffect } from "react";
import { listProductsBy } from '../../api/product';
import ProductCard from '../card/ProductCard';
import SwiperMenu from './SwiperMenu';
import { SwiperSlide } from 'swiper/react';

const BestMenu = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
   
  
  useEffect(() => {
    loadBestSellingProducts()

    }, [])

    const loadBestSellingProducts = () => {
        listProductsBy("sold", "desc", 5)
        .then((res) => {
            setBestSellingProducts(res.data)
        })

        .catch((err) => {
            console.log(err)
        })
    }


  return (
    <SwiperMenu>
      {
        bestSellingProducts.map((item, index) => (
            <SwiperSlide>
          <ProductCard key={index} item={item} />
            </SwiperSlide>
        ))
      }
    </SwiperMenu>
  )
}

export default BestMenu
