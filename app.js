// Almaz Service WebApp — Core Engine
const tg = window.Telegram?.WebApp;

// Official Game Catalog Data (Matches Bot Database Exactly)
const catalog = {
    freefire: {
        name: "Free Fire",
        title: "🔥 Free Fire Paketlari",
        hint: "Free Fire profilingizdagi raqamli UID ni kiriting",
        packages: [
            { id: 1, name: "110 💎 Almaz", amount: 110, price: 13000, tag: "⚡ Kichik", icon: "💎" },
            { id: 2, name: "341 💎 Almaz", amount: 341, price: 41000, tag: "🔥 Tavsiya", icon: "💎" },
            { id: 3, name: "572 💎 Almaz", amount: 572, price: 64000, tag: "⭐ Ommabop", icon: "💎" },
            { id: 4, name: "1166 💎 Almaz", amount: 1166, price: 138000, tag: "👑 VIP", icon: "💎" },
            { id: 5, name: "2398 💎 Almaz", amount: 2398, price: 267000, tag: "💎 Mega", icon: "💎" },
            { id: 6, name: "6160 💎 Almaz", amount: 6160, price: 637000, tag: "🔥 Super VIP", icon: "💎" },
            { id: 7, name: "Haftalik LITE", amount: 1, price: 7000, tag: "🎟️ Vaucher", icon: "🎟️" },
            { id: 8, name: "Haftalik Vaucher", amount: 1, price: 22000, tag: "🎟️ Haftalik", icon: "🎟️" },
            { id: 9, name: "Oylik Vaucher", amount: 1, price: 130000, tag: "🎟️ Oylik", icon: "🎟️" }
        ]
    },
    pubg: {
        name: "PUBG Mobile",
        title: "🪙 PUBG Mobile Paketlari",
        hint: "PUBG profilingizdagi Character ID raqamingizni kiriting",
        packages: [
            { id: 10, name: "60 UC", amount: 60, price: 12000, tag: "⚡ Tezkor", icon: "🪙" },
            { id: 11, name: "325 + 25 UC", amount: 350, price: 58000, tag: "🔥 Tavsiya", icon: "🪙" },
            { id: 12, name: "660 + 60 UC", amount: 720, price: 115000, tag: "⭐ Ommabop", icon: "🪙" },
            { id: 13, name: "1800 + 300 UC", amount: 2100, price: 285000, tag: "👑 VIP", icon: "🪙" },
            { id: 14, name: "Royale Pass", amount: 1, price: 115000, tag: "🎖️ RP", icon: "🏆" }
        ]
    }
};

const state = {
    activeGame: 'freefire',
    selectedPackage: null,
    playerId: '',
    user: null
};

// Utilities
function formatUzs(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

function showToast(text) {
    const toast = document.getElementById('toastMessage');
    toast.textContent = text;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2200);
}

// Initialize Telegram WebApp
function initTelegram() {
    if (tg) {
        tg.ready();
        tg.expand();
        try { tg.enableClosingConfirmation(); } catch (e) {}

        const user = tg.initDataUnsafe?.user;
        if (user) {
            state.user = user;
            const initial = (user.first_name || "A").charAt(0).toUpperCase();
            document.getElementById('userAvatar').textContent = initial;
            document.getElementById('userName').textContent = user.first_name || "Foydalanuvchi";
            document.getElementById('userId').textContent = `ID: ${user.id}`;
        }
    }
}

// Render Packages for Active Game
function renderPackages() {
    const data = catalog[state.activeGame];
    document.getElementById('catalogTitle').textContent = data.title;
    document.getElementById('catalogBadge').textContent = `${data.packages.length} ta tarif`;
    document.getElementById('gameIdHint').textContent = data.hint;

    const grid = document.getElementById('packagesGrid');
    grid.innerHTML = '';

    data.packages.forEach(pkg => {
        const isSelected = state.selectedPackage && state.selectedPackage.id === pkg.id;
        const card = document.createElement('div');
        card.className = `pkg-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <span class="pkg-badge">${pkg.tag}</span>
            <div class="pkg-top">
                <span class="pkg-icon">${pkg.icon}</span>
                <span class="pkg-name">${pkg.name}</span>
            </div>
            <span class="pkg-price">${formatUzs(pkg.price)}</span>
        `;
        card.addEventListener('click', () => selectPackage(pkg));
        grid.appendChild(card);
    });

    updateCheckoutBar();
}

// Select Package
function selectPackage(pkg) {
    if (state.selectedPackage && state.selectedPackage.id === pkg.id) {
        state.selectedPackage = null;
    } else {
        state.selectedPackage = pkg;
        // Haptic feedback in Telegram
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
    renderPackages();
}

// Update Bottom Checkout Bar
function updateCheckoutBar() {
    const label = document.getElementById('checkoutLabel');
    const price = document.getElementById('checkoutPrice');
    const btn = document.getElementById('checkoutBtn');

    if (state.selectedPackage) {
        label.textContent = `${catalog[state.activeGame].name} • ${state.selectedPackage.name}`;
        price.textContent = formatUzs(state.selectedPackage.price);
        btn.disabled = false;
    } else {
        label.textContent = "Paketni tanlang";
        price.textContent = "0 so'm";
        btn.disabled = true;
    }
}

// Switch Game
function switchGame(gameCode) {
    if (state.activeGame === gameCode) return;
    state.activeGame = gameCode;
    state.selectedPackage = null;

    document.getElementById('tabBtnFF').classList.toggle('active', gameCode === 'freefire');
    document.getElementById('tabBtnPubg').classList.toggle('active', gameCode === 'pubg');

    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
    renderPackages();
}

// Checkout Submit
function handleCheckout() {
    const idInput = document.getElementById('playerIdInput');
    const playerId = idInput.value.trim();

    if (!playerId) {
        idInput.focus();
        showToast("⚠️ Iltimos, avval Player ID raqamini kiriting!");
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }
        return;
    }

    if (!state.selectedPackage) {
        showToast("⚠️ Iltimos, kerakli paketni tanlang!");
        return;
    }

    const orderPayload = {
        action: "web_app_order",
        game_code: state.activeGame,
        game_name: catalog[state.activeGame].name,
        package_id: state.selectedPackage.id,
        package_name: state.selectedPackage.name,
        amount: state.selectedPackage.amount,
        price: state.selectedPackage.price,
        player_id: playerId
    };

    // If inside Telegram WebApp
    if (tg && tg.sendData) {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
        tg.sendData(JSON.stringify(orderPayload));
        tg.close();
    } else {
        // Outside Telegram fallback
        const botUsername = "n1almazserviceuz_bot";
        const msg = `Buyurtma: ${catalog[state.activeGame].name} - ${state.selectedPackage.name}\nPlayer ID: ${playerId}\nNarxi: ${formatUzs(state.selectedPackage.price)}`;
        const tgUrl = `https://t.me/${botUsername}?start=order_${state.activeGame}_${state.selectedPackage.id}_${encodeURIComponent(playerId)}`;
        window.location.href = tgUrl;
    }
}

// Copy Card Number
function copyCardNumber() {
    const cardNum = "9860606749023424";
    navigator.clipboard.writeText(cardNum).then(() => {
        showToast("✅ Karta raqami nusxalandi!");
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    }).catch(() => {
        showToast("9860 6067 4902 3424");
    });
}

// Setup Event Listeners
function setupEvents() {
    // Tabs
    document.getElementById('tabBtnFF').addEventListener('click', () => switchGame('freefire'));
    document.getElementById('tabBtnPubg').addEventListener('click', () => switchGame('pubg'));

    // Copy Card
    document.getElementById('copyCardBtn').addEventListener('click', copyCardNumber);

    // Paste ID
    document.getElementById('pasteIdBtn').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('playerIdInput').value = text.trim();
                showToast("✅ ID joylandi!");
            }
        } catch (e) {
            document.getElementById('playerIdInput').focus();
        }
    });

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);

    // Help Modal
    const helpModal = document.getElementById('helpModal');
    document.getElementById('idHelpBtn').addEventListener('click', () => {
        helpModal.classList.remove('hidden');
    });
    document.getElementById('closeHelpModal').addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });
    document.getElementById('gotItBtn').addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    setupEvents();
    renderPackages();
});
