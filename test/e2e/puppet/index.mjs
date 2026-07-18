// Puppet provider extension (T3), loaded per invocation via `pi -e test/e2e/puppet/`.
// Never referenced by the pi-sdlc package manifest — no production leak. It
// registers a zero-cost `puppet` provider with a dummy non-secret key, pointing
// at the local scripted server whose URL the harness passes in PUPPET_BASE_URL.

export default function (pi) {
	const baseUrl = process.env.PUPPET_BASE_URL ?? "http://127.0.0.1:18800/v1";
	pi.registerProvider("puppet", {
		name: "Puppet",
		baseUrl,
		apiKey: "puppet-dummy-not-a-secret",
		api: "openai-completions",
		models: [
			{
				id: "puppet-model",
				name: "Puppet Model",
				reasoning: false,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 128000,
				maxTokens: 256,
			},
		],
	});
}
