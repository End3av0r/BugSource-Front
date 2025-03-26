import { useState, useCallback } from 'react';
import { VulnerabilityInfoVO } from "@/types/VulnerabilityInfoVO";

// API返回信息
interface ApiResponse1{
    code: string;
    info: string;
    data: VulnerabilityInfoVO[]
}
interface ApiResponse2 {
    code: string;
    info: string;
    data: {
        data: VulnerabilityInfoVO[];
        total: number;
    };
}
// 定义请求体接口
interface VulnerabilityInfoRequestDTO {
    offset: number;
    limit: number;
    cnvdId?: string;
    cveId?: string;
    cnTitle?: string;
    startDate?: string;
    endDate?: string;
    searchType?: string;
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
            const result: ApiResponse1 = await response.json();
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
//  查询请求函数

// api/index.tsx
const useQuaryVulnerabilities = () => {
    const [dataSource, setDataSource] = useState<VulnerabilityInfoVO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalVulnerabilities, setTotalVulnerabilities] = useState(0); // 用于存储总漏洞数

    const fetchVulnerabilities = useCallback(async (requestBody: any) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Request Body:", requestBody); // 调试信息
            const response = await fetch(`${API_BASE_URL}query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result: ApiResponse2 = await response.json();
            if (result.code === '0000') {
                // 假设后端返回的数据结构中包含 data 和 total
                setDataSource(result.data.data);
                setTotalVulnerabilities(result.data.total);
            } else {
                throw new Error(result.info || 'Failed to fetch vulnerabilities');
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

    return { dataSource, loading, error, totalVulnerabilities, fetchVulnerabilities };
};

// 导出查询请求函数
export { useFetchVulnerabilities,useQuaryVulnerabilities };
