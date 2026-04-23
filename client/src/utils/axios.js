import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://cricketgear.vercel.app',
  withCredentials: true,
});

export default instance;
