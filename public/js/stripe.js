import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (toorId) => {
  const stripe = Stripe(
    'pk_test_51J2E6TKn619xdMBGw1vG48dSKgornWGaB1wDe7sNAWy797d8kYfGRfWBiJ3JkYl0vrvG7zXr4FaOko2ewf4j4pCn00xJnXSLQ0'
  );

  try {
    // 1)get checout session fron emdpoint
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${toorId}`
    );
 
    //2) use stripe object form +charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);

    showAlert('error', err);
  }
};
