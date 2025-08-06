# Fetch content
```bash
npm run dev -- fetch --url https://example.com --output ./output/content.json
```

# Enrich content
```bash
npm run dev -- enrich --file ./output/content.json --type summary --output ./output/enriched.json
```

# Organize content
```bash
npm run dev -- organize --file ./output/enriched.json --categories "Technology,Business,Science" --output ./output/organized.json
```

# Analyze content
```bash
npm run dev -- analyze --file ./output/organized.json --query "What are the key insights?" --output ./output/analysis.json
```
