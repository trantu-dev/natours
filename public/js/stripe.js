import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_zh7g6ZTRMTjBVK9HBUvTTlJb00CTvA4zvG');

export const bookTour = async tourID => {
  try {
    const res = await axios.get(`/api/v1/bookings/checkout-session/${tourID}`);

    await stripe.redirectToCheckout({
      sessionId: res.data.session.id
    });
  } catch (error) {
    showAlert('error', error.message);
  }
};
