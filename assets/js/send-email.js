// File: assets/js/send-email.js
(function() {
    'use strict';
    
    // GANTI DENGAN ACCESS KEY ANDA DARI WEB3FORMS
    const WEB3FORMS_ACCESS_KEY = "86f63516-b064-4868-8b43-d84b1d07006a";
    
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg transform transition-all duration-500 z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                ${type === 'success' 
                    ? '<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    : '<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                }
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animasi masuk
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hapus notifikasi setelah 5 detik
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    // Fungsi untuk validasi form
    function validateForm(formData) {
        let isValid = true;
        
        // Reset error messages
        document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('border-red-500'));
        
        // Validasi nama
        const name = formData.get('name').trim();
        if (!name) {
            document.getElementById('name-error').classList.remove('hidden');
            document.getElementById('name').classList.add('border-red-500');
            isValid = false;
        }
        
        // Validasi email
        const email = formData.get('email').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('email-error').classList.remove('hidden');
            document.getElementById('email').classList.add('border-red-500');
            isValid = false;
        }
        
        // Validasi subjek
        const subject = formData.get('subject').trim();
        if (!subject) {
            document.getElementById('subject-error').classList.remove('hidden');
            document.getElementById('subject').classList.add('border-red-500');
            isValid = false;
        }
        
        // Validasi pesan
        const message = formData.get('message').trim();
        if (message.length < 10) {
            document.getElementById('message-error').classList.remove('hidden');
            document.getElementById('message').classList.add('border-red-500');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // Validasi form
        if (!validateForm(formData)) {
            showNotification('Mohon lengkapi form dengan benar', 'error');
            return;
        }
        
        try {
            // Update button state
            submitBtn.disabled = true;
            buttonText.textContent = 'Mengirim...';
            loadingSpinner.classList.remove('hidden');
            
            // Tambahkan access key
            formData.append("access_key", WEB3FORMS_ACCESS_KEY);
            
            // Kirim ke Web3Forms
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Pesan berhasil dikirim! Terima kasih telah menghubungi saya.');
                this.reset();
                
                // Reset form styling
                document.querySelectorAll('input, textarea').forEach(el => {
                    el.classList.remove('border-red-500');
                });
            } else {
                throw new Error(data.message || 'Gagal mengirim email');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            buttonText.textContent = 'Kirim Pesan';
            loadingSpinner.classList.add('hidden');
        }
    });
    
    // Real-time validation dengan debounce
    const inputs = form.querySelectorAll('input, textarea');
    let debounceTimer;
    
    inputs.forEach(input => {
        // Hapus error saat user mulai mengetik
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            this.classList.remove('border-red-500');
            
            const errorElement = document.getElementById(this.id + '-error');
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        });
        
        // Validasi saat user selesai mengetik
        input.addEventListener('blur', function() {
            debounceTimer = setTimeout(() => {
                if (this.required && !this.value.trim()) {
                    this.classList.add('border-red-500');
                    const errorElement = document.getElementById(this.id + '-error');
                    if (errorElement) {
                        errorElement.classList.remove('hidden');
                    }
                }
                
                // Validasi khusus untuk email
                if (this.type === 'email' && this.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(this.value)) {
                        this.classList.add('border-red-500');
                        document.getElementById('email-error').classList.remove('hidden');
                    }
                }
                
                // Validasi khusus untuk pesan
                if (this.id === 'message' && this.value && this.value.length < 10) {
                    this.classList.add('border-red-500');
                    document.getElementById('message-error').classList.remove('hidden');
                }
            }, 500);
        });
    });
})();