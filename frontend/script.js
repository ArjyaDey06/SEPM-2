class GamingArenaBooking {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedSeats = new Set();
        this.seatPrice = 25;
        this.bookingData = this.loadBookingData();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setMinDate();
        this.updateSeatStats();
    }

    initializeElements() {
        this.dateInput = document.getElementById('dateInput');
        this.timeSlots = document.getElementById('timeSlots');
        this.seatsContainer = document.querySelector('.seats-container');
        this.summaryDate = document.getElementById('summaryDate');
        this.summaryTime = document.getElementById('summaryTime');
        this.summarySeats = document.getElementById('summarySeats');
        this.totalPrice = document.getElementById('totalPrice');
        this.bookBtn = document.getElementById('bookBtn');
        this.modal = document.getElementById('confirmationModal');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Stats elements
        this.totalSeatsEl = document.getElementById('totalSeats');
        this.availableSeatsEl = document.getElementById('availableSeats');
        this.occupiedSeatsEl = document.getElementById('occupiedSeats');
    }

    setupEventListeners() {
        // Date selection
        this.dateInput.addEventListener('change', (e) => {
            this.selectedDate = e.target.value;
            this.updateSummary();
            this.updateSeatAvailability();
        });

        // Time slot selection
        this.timeSlots.addEventListener('click', (e) => {
            if (e.target.classList.contains('slot-btn')) {
                this.selectTimeSlot(e.target);
            }
        });

        // Seat selection
        this.seatsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
                this.toggleSeatSelection(e.target);
            }
        });

        // Booking button
        this.bookBtn.addEventListener('click', () => {
            this.showConfirmationModal();
        });

        // Modal buttons
        this.confirmBtn.addEventListener('click', () => {
            this.confirmBooking();
        });

        this.cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    selectTimeSlot(slotBtn) {
        // Remove active class from all slots
        document.querySelectorAll('.slot-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected slot
        slotBtn.classList.add('active');
        this.selectedTime = slotBtn.dataset.time;
        
        this.updateSummary();
        this.updateSeatAvailability();
    }

    toggleSeatSelection(seatElement) {
        const seatId = seatElement.dataset.seat;
        
        if (this.selectedSeats.has(seatId)) {
            this.selectedSeats.delete(seatId);
            seatElement.classList.remove('selected');
        } else {
            this.selectedSeats.add(seatId);
            seatElement.classList.add('selected');
        }
        
        this.updateSummary();
        this.updateBookingButton();
    }

    updateSeatAvailability() {
        if (!this.selectedDate || !this.selectedTime) {
            // Reset all seats to available except permanently occupied ones
            document.querySelectorAll('.seat').forEach(seat => {
                if (!seat.classList.contains('permanently-occupied')) {
                    seat.classList.remove('occupied');
                    seat.classList.add('available');
                }
            });
            return;
        }

        const bookingKey = `${this.selectedDate}_${this.selectedTime}`;
        const occupiedSeats = this.bookingData[bookingKey] || [];

        document.querySelectorAll('.seat').forEach(seat => {
            const seatId = seat.dataset.seat;
            
            if (occupiedSeats.includes(seatId)) {
                seat.classList.add('occupied');
                seat.classList.remove('available', 'selected');
                this.selectedSeats.delete(seatId);
            } else if (!seat.classList.contains('permanently-occupied')) {
                seat.classList.remove('occupied');
                seat.classList.add('available');
            }
        });

        this.updateSeatStats();
        this.updateSummary();
        this.updateBookingButton();
    }

    updateSeatStats() {
        const allSeats = document.querySelectorAll('.seat');
        const availableSeats = document.querySelectorAll('.seat.available');
        const occupiedSeats = document.querySelectorAll('.seat.occupied');

        this.totalSeatsEl.textContent = allSeats.length;
        this.availableSeatsEl.textContent = availableSeats.length;
        this.occupiedSeatsEl.textContent = occupiedSeats.length;
    }

    updateSummary() {
        // Update date
        if (this.selectedDate) {
            const date = new Date(this.selectedDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.summaryDate.textContent = date.toLocaleDateString('en-US', options);
        } else {
            this.summaryDate.textContent = 'Not selected';
        }

        // Update time
        if (this.selectedTime) {
            this.summaryTime.textContent = this.selectedTime.replace('-', ' to ');
        } else {
            this.summaryTime.textContent = 'Not selected';
        }

        // Update seats
        if (this.selectedSeats.size > 0) {
            const sortedSeats = Array.from(this.selectedSeats).sort();
            this.summarySeats.textContent = sortedSeats.join(', ');
        } else {
            this.summarySeats.textContent = 'None selected';
        }

        // Update total price
        const total = this.selectedSeats.size * this.seatPrice;
        this.totalPrice.textContent = `$${total}`;
    }

    updateBookingButton() {
        const canBook = this.selectedDate && this.selectedTime && this.selectedSeats.size > 0;
        this.bookBtn.disabled = !canBook;
    }

    showConfirmationModal() {
        // Update modal content
        document.getElementById('confirmDate').textContent = this.summaryDate.textContent;
        document.getElementById('confirmTime').textContent = this.summaryTime.textContent;
        document.getElementById('confirmSeats').textContent = this.summarySeats.textContent;
        document.getElementById('confirmTotal').textContent = this.totalPrice.textContent;

        // Show modal
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    confirmBooking() {
        const bookingKey = `${this.selectedDate}_${this.selectedTime}`;
        
        // Initialize booking data for this slot if not exists
        if (!this.bookingData[bookingKey]) {
            this.bookingData[bookingKey] = [];
        }

        // Add selected seats to booking data
        this.selectedSeats.forEach(seatId => {
            this.bookingData[bookingKey].push(seatId);
        });

        // Save booking data
        this.saveBookingData();

        // Show success message
        this.showSuccessMessage();

        // Reset selection
        this.resetSelection();

        // Close modal
        this.closeModal();

        // Update seat availability
        this.updateSeatAvailability();
    }

    showSuccessMessage() {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎮 Booking Confirmed!</h4>
                <p>Your gaming seats have been successfully reserved.</p>
                <p>Booking ID: #${this.generateBookingId()}</p>
            </div>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            color: #0a0a0f;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.5);
            z-index: 2000;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    generateBookingId() {
        return 'GA' + Date.now().toString(36).toUpperCase();
    }

    resetSelection() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedSeats.clear();

        // Reset UI
        this.dateInput.value = '';
        document.querySelectorAll('.slot-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.seat.selected').forEach(seat => {
            seat.classList.remove('selected');
        });

        this.updateSummary();
        this.updateBookingButton();
    }

    loadBookingData() {
        const saved = localStorage.getItem('gamingArenaBookings');
        return saved ? JSON.parse(saved) : this.generateMockData();
    }

    saveBookingData() {
        localStorage.setItem('gamingArenaBookings', JSON.stringify(this.bookingData));
    }

    generateMockData() {
        // Generate some mock booking data for demonstration
        const mockData = {};
        const today = new Date();
        
        // Add some bookings for tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        mockData[`${tomorrowStr}_09:00-12:00`] = ['A3', 'B2'];
        mockData[`${tomorrowStr}_15:00-18:00`] = ['C4', 'D5'];
        
        // Add some bookings for day after tomorrow
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        const dayAfterStr = dayAfter.toISOString().split('T')[0];
        
        mockData[`${dayAfterStr}_12:00-15:00`] = ['B6', 'A3'];
        mockData[`${dayAfterStr}_18:00-21:00`] = ['D5', 'C4', 'B2'];
        
        return mockData;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamingArenaBooking();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effect to arena stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('mouseenter', () => {
            stat.style.transform = 'scale(1.1)';
            stat.style.transition = 'transform 0.3s ease';
        });
        
        stat.addEventListener('mouseleave', () => {
            stat.style.transform = 'scale(1)';
        });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('confirmationModal');
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        }
    });

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
});

// Utility functions for date formatting
const DateUtils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },
    
    formatTime: (timeString) => {
        return timeString.replace('-', ' to ');
    },
    
    isToday: (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    },
    
    isFuture: (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date > today;
    }
};

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes glow {
        0%, 100% {
            box-shadow: 0 0 5px var(--primary-color);
        }
        50% {
            box-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
        }
    }
    
    .success-notification h4 {
        margin: 0 0 10px 0;
        font-family: 'Orbitron', monospace;
        font-size: 1.1rem;
        text-transform: uppercase;
    }
    
    .success-notification p {
        margin: 5px 0;
        font-size: 0.9rem;
    }
    
    .notification-content {
        text-align: center;
    }
`;
document.head.appendChild(style);
