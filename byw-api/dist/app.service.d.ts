import { DataSource } from 'typeorm';
export declare class AppService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getHealth(): {
        status: string;
        database: string;
    };
}
