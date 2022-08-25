import MetadataAPI from "./MetadataAPI";

interface TestMetadataAPI extends MetadataAPI {
	clearTables: () => Promise<void>
}

export default TestMetadataAPI;