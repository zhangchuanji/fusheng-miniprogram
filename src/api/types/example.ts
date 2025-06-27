export interface IExampleRequest {
    pageNo: number
    pageSize: number
}

export interface IExampleResponse {
    total: number
    list: {
        id: number
        name: string
    }[]
}
