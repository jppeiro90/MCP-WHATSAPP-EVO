import axios, { type AxiosInstance, type Method } from "axios";

/**
 * Thin generic HTTP client for the Evolution API.
 *
 * Every tool builds its own endpoint path and passes the body/query, so we only
 * need one place that knows about the base URL, the `apikey` header and error
 * normalization. Credentials are read from the environment:
 *   - EVOLUTION_API_URL  (e.g. https://evo.example.com)
 *   - EVOLUTION_API_KEY  (the global AUTHENTICATION_API_KEY)
 */
export class EvolutionClient {
	private http: AxiosInstance;

	constructor() {
		const rawUrl = process.env.EVOLUTION_API_URL ?? "";
		const url = rawUrl.replace(/\/+$/, "");
		const key = process.env.EVOLUTION_API_KEY ?? "";

		if (!url) {
			throw new Error("EVOLUTION_API_URL environment variable is not set");
		}
		if (!key) {
			throw new Error("EVOLUTION_API_KEY environment variable is not set");
		}

		this.http = axios.create({
			baseURL: url,
			headers: {
				"Content-Type": "application/json",
				apikey: key,
			},
		});
	}

	async request<T = unknown>(
		method: Method,
		path: string,
		opts?: { data?: unknown; params?: Record<string, unknown> },
	): Promise<T> {
		try {
			const res = await this.http.request<T>({
				method,
				url: path,
				data: opts?.data,
				params: opts?.params,
			});
			return res.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const data = error.response?.data as { message?: unknown } | undefined;
				const detail = data?.message ?? error.message;
				const text =
					typeof detail === "string" ? detail : JSON.stringify(detail);
				throw new Error(
					`Evolution API ${method} ${path} failed (${error.response?.status ?? "no status"}): ${text}`,
				);
			}
			throw error;
		}
	}
}

/**
 * Lazily-created singleton. Lazy so that importing tool modules never triggers
 * the env-var validation before `dotenv` has had a chance to run in main.ts.
 */
let instance: EvolutionClient | null = null;

export const getClient = (): EvolutionClient => {
	if (!instance) {
		instance = new EvolutionClient();
	}
	return instance;
};
