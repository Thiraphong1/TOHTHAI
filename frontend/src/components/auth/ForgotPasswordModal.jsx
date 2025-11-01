// src/components/auth/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, LoaderCircle, AlertCircle,XCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null); // สำหรับแสดงผลข้อความสำเร็จ

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            // ✅ API Call ไปยัง Backend
            // URL นี้ต้องตรงกับ Route ที่คุณสร้างไว้ใน Backend
            const res = await axios.post('https://tohthaibackend.vercel.app/api/forgot-password', { email }); 
            
            setMessage({ type: 'success', text: res.data.message || 'ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว' });
            toast.success('กรุณาตรวจสอบอีเมลของคุณ');

        } catch (err) {
            const errMsg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ';
            setMessage({ type: 'error', text: errMsg });
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800">ลืมรหัสผ่าน?</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>

                {message?.type === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <p className="text-gray-700 font-medium">{message.text}</p>
                        <button onClick={onClose} className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg">
                            ตกลง
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-gray-600">
                            กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
                        </p>
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                                />
                            </div>
                            {message?.type === 'error' && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14}/> {message.text}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-300 flex items-center gap-2"
                            >
                                {isSubmitting && <LoaderCircle size={20} className="animate-spin" />}
                                ส่งลิงก์ตั้งรหัสผ่าน
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordModal;