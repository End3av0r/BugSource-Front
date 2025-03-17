import { useState, useCallback } from 'react';
import { VulnerabilityInfoVO } from "@/types/VulnerabilityInfoVO";

// API返回信息
interface ApiResponse {
    code: string;
    info: string;
    data: VulnerabilityInfoVO[];
}

const API_BASE_URL = 'http://localhost:8091/api/vuln/'; // 请替换为实际的后端 API 基础 URL

// 封装请求函数
const useFetchVulnerabilities = () => {
    const [dataSource, setDataSource] = useState<VulnerabilityInfoVO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVulnerabilities = useCallback(async (offset: number, limit: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL + `latest?offset=${offset}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result: ApiResponse = await response.json();
            if (result.code === '0000') {
                setDataSource(result.data);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return { dataSource, loading, error, fetchVulnerabilities };
};

export { useFetchVulnerabilities };