import {loadStripe} from '@stripe/stripe-js';

const stripe = await loadStripe('sk_test_51QDGPiI6EaI6qsaTLEEIUNG59NPqKepiqStt7jjvYjaA55gzJI1mITi20o5sV2pYTU1mLDgxrFJBqsTWXpiGCleh00gXlr9reF');

export default stripe;
