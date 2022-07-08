export declare type DateType = 'day' | 'week' | 'month';

export declare interface Article {
    title: any;
    href: any;
}

export declare type Category = {
    [index in DateType]: Article[];
};
