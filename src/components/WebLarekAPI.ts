import { Api, ApiListResponse } from './base/api';
import{ IProduct, IOrder, IOrderResult } from '../types';

export interface IWebLarekAPI {
    getProductList: () => Promise<IProduct[]>;
    postOrder: (order: IOrder) => Promise<IOrderResult>;
}

export class WebLarekAPI extends Api implements IWebLarekAPI {
	readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
        this.cdn = cdn;
    }

	async getProductList(): Promise<IProduct[]> {
		return await this.get('/product').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    async postOrder(order: IOrder): Promise<IOrderResult> {
        		return await this
         			.post('/order', order)
        			.then((data: IOrderResult) => data);
    }
}
