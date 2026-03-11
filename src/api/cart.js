import { get, post } from '/@/utils/http/axios';

const URL = {
    list: '/api/order/cart/list',
    add: '/api/order/cart/add',
    updateCount: '/api/order/cart/updateCount',
    delete: '/api/order/cart/delete',
    checkout: '/api/order/cart/checkout',
};

const listApi = async (params) =>
    get({ url: URL.list, params: params, data: {}, headers: {} });

const addApi = async (params) =>
    post({ url: URL.add, params: params, headers: {} });

const updateCountApi = async (params) =>
    post({ url: URL.updateCount, params: params, headers: {} });

const deleteApi = async (params) =>
    post({ url: URL.delete, params: params, headers: {} });

const checkoutApi = async (params) =>
    post({ url: URL.checkout, params: params, headers: {} });

export { listApi, addApi, updateCountApi, deleteApi, checkoutApi };
