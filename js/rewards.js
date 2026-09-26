/**
 * MR.COFFEE - REWARDS & PROMO ENGINE
 * Handles: Copy Voucher, Direct Redeem in Order, App Download Modal
 */

window.copyVoucher = function(code, btn) {
    navigator.clipboard.writeText(code).then(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast(`✨ Kode promo <strong>${code}</strong> berhasil disalin!`);
        }
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Disalin';
            btn.style.color = '#2D6A4F';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.color = '';
            }, 1800);
        }
    }).catch(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast(`✨ Kode promo: <strong>${code}</strong>`);
        }
    });
};

window.redeemVoucher = function(code) {
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.showToast(`🚀 Membuka pemesanan dengan voucher <strong>${code}</strong>...`);
    }
    // Redirect to order page
    setTimeout(() => {
        window.location.href = 'order.html';
    }, 400);
};

window.showAppDownload = function() {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.closeAppDownload = function() {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAppDownload();
            }
        });
    }
});
