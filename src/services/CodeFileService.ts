/**
 * 代码文件服务 - 封装后端 API 调用
 */

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 代码文件接口
export interface CodeFileDTO {
  id?: string;
  name: string;
  type: 'indicator' | 'strategy' | 'library';
  content: string;
  description?: string;
  author?: string;
  version?: string;
  lastModified?: string;
}

// API 响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 代码文件服务类
 */
class CodeFileService {
  private userId: number = 1; // 临时写死，实际应从登录状态获取

  /**
   * 获取文件列表（按类型）
   */
  async listByType(type: 'indicator' | 'strategy' | 'library'): Promise<CodeFileDTO[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/code-file/list?type=${type}&userId=${this.userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CodeFileDTO[]> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '获取文件列表失败');
      }

      return result.data || [];
    } catch (error) {
      console.error('获取文件列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有文件列表
   */
  async listAll(): Promise<{
    indicators: CodeFileDTO[];
    strategies: CodeFileDTO[];
    libraries: CodeFileDTO[];
  }> {
    const [indicators, strategies, libraries] = await Promise.all([
      this.listByType('indicator'),
      this.listByType('strategy'),
      this.listByType('library'),
    ]);

    return { indicators, strategies, libraries };
  }

  /**
   * 获取文件详情
   */
  async getById(id: string, type: 'indicator' | 'strategy' | 'library'): Promise<CodeFileDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/code-file/${id}?type=${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CodeFileDTO> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '获取文件详情失败');
      }

      return result.data;
    } catch (error) {
      console.error('获取文件详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建文件
   */
  async create(file: CodeFileDTO): Promise<CodeFileDTO> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/code-file/create?type=${file.type}&userId=${this.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(file),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CodeFileDTO> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '创建文件失败');
      }

      return result.data;
    } catch (error) {
      console.error('创建文件失败:', error);
      throw error;
    }
  }

  /**
   * 更新文件
   */
  async update(file: CodeFileDTO): Promise<CodeFileDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/code-file/update?type=${file.type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CodeFileDTO> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '更新文件失败');
      }

      return result.data;
    } catch (error) {
      console.error('更新文件失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async delete(id: string, type: 'indicator' | 'strategy' | 'library'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/code-file/${id}?type=${type}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '删除文件失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 复制文件
   */
  async copy(id: string, type: 'indicator' | 'strategy' | 'library'): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/code-file/copy/${id}?type=${type}&userId=${this.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<string> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '复制文件失败');
      }

      return result.data;
    } catch (error) {
      console.error('复制文件失败:', error);
      throw error;
    }
  }

  /**
   * 重命名文件
   */
  async rename(id: string, type: 'indicator' | 'strategy' | 'library', newName: string): Promise<CodeFileDTO> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/code-file/rename/${id}?type=${type}&newName=${encodeURIComponent(newName)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CodeFileDTO> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '重命名文件失败');
      }

      return result.data;
    } catch (error) {
      console.error('重命名文件失败:', error);
      throw error;
    }
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: number) {
    this.userId = userId;
  }

  /**
   * 获取当前用户ID
   */
  getUserId(): number {
    return this.userId;
  }
}

// 导出单例
export const codeFileService = new CodeFileService();
