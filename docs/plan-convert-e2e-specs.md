Plan: Convert E2E Specs to UI-Only Serial Scenarios with Per-File Isolation
---------------------------------------------------------------------------

### Summary

*   Remove all E2E reliance on backend reset APIs and global DB cleanup.
    
*   Make each spec file a single serial scenario flow: tests inside one file run in order and share one scenario state, while different spec files can run in parallel on different Playwright workers.
    
*   Use unique, human-readable entity names per spec file run so reruns remain safe even if old rows were not deleted.
    
*   Remove tests that require a globally empty database.
    

### Key Changes

*   Test execution model:
    
    *   Keep Playwright parallelism at the file level.
        
    *   Set each scenario file to serial mode with test.describe.configure({ mode: 'serial' }).
        
    *   Remove global DB reset assumptions from playwright.config.ts.
        
    *   Allow multiple workers again globally, but do not enable parallel execution within a file.
        
*   UI-only lifecycle:
    
    *   Delete clearTestData() / clearLocalStorage() usage from tests/pages/BasePage.ts.
        
    *   Replace beforeEach reset logic in the spec files with UI-only navigation/setup.
        
    *   Add afterAll cleanup per spec file using browser-driven UI steps, not API calls.
        
    *   Cleanup should target only entities created by that file’s unique scenario prefix.
        
*   Unique data strategy:
    
    *   Introduce a scenario-scoped test data helper based on the existing dataFactory.
        
    *   Generate one unique scenarioId per spec file run, for example warehouses-\-.
        
    *   Build all warehouse/product/position names from that scenarioId, so collisions across parallel files and reruns are impossible.
        
    *   Keep generated names readable in UI and reports, not pure UUIDs.
        
*   Spec restructuring:
    
    *   tests/warehouses.spec.ts: remove empty-state test; convert to serial scenario create -> edit -> delete, with optional cancel/validation tests using uniquely named temporary entities that clean up through the UI if they create anything.
        
    *   tests/products.spec.ts: same pattern as warehouses.
        
    *   tests/positions.spec.ts: create unique warehouse and product through the UI first, then create/edit/delete a unique position, then remove supporting product/warehouse in file teardown.
        
    *   Each spec file should keep a small shared scenario state object, e.g. created names and discovered IDs, so later tests in that file can continue the flow.
        
*   Page object improvements:
    
    *   Add targeted UI helpers such as “find by exact visible name”, “delete if present by exact name”, and “open edit by exact name” for warehouses/products/positions.
        
    *   Do not rely on counts or empty lists as proof of cleanup.
        
    *   Make cleanup helpers tolerant: if an item is already missing, cleanup should continue rather than fail the whole spec.
        
*   Backend/API cleanup:
    
    *   Remove /test/reset from apps/api/src/routes/system.js.
        
    *   Remove test reset token logic from UI-test infrastructure.
        
    *   Update API integration tests in apps/api/tests/api.test.js to reset state directly through DB access in test code, not through an HTTP reset endpoint.
        
*   Documentation:
    
    *   Update README.md to state:
        
        *   UI tests do setup/cleanup only through the UI
            
        *   empty-database assumptions were intentionally removed
            
        *   spec files are serial internally, but the suite supports parallel file execution
            
        *   unique scenario IDs are used to make reruns safe
            

### Important API / Test Interface Changes

*   Remove from backend:
    
    *   DELETE /test/reset
        
*   Remove from Playwright page layer:
    
    *   BasePage.clearTestData()
        
    *   BasePage.clearLocalStorage()
        
*   Add in test fixture layer:
    
    *   scenario-aware data generation, e.g. dataFactory.forScenario('warehouses', scenarioId) or equivalent object-based helper returning createWarehouse/createProduct/createPosition methods with unique names baked in
        

### Test Cases and Scenarios

*   Warehouse scenario file:
    
    *   create one unique warehouse
        
    *   edit the same warehouse
        
    *   delete the same warehouse
        
    *   afterAll attempts UI cleanup of any leftover warehouse matching the scenario prefix
        
*   Product scenario file:
    
    *   create one unique product
        
    *   edit the same product
        
    *   delete the same product
        
    *   afterAll removes leftovers matching the scenario prefix
        
*   Position scenario file:
    
    *   create unique warehouse and product through UI
        
    *   create a position using those entities
        
    *   edit that position
        
    *   delete that position
        
    *   afterAll deletes leftover supporting product and warehouse via UI
        
*   Parallel validation:
    
    *   run the suite with multiple Playwright workers
        
    *   confirm different spec files do not collide because names are unique
        
    *   rerun the suite without manual DB cleanup and confirm tests still pass
        

### Assumptions

*   Tests inside a single spec file are intentionally sequential and may depend on prior steps in the same file.
    
*   Different spec files must be safe to run in parallel.
    
*   UI-only setup and teardown is mandatory for E2E tests.
    
*   Tests that require a globally empty database will be removed rather than preserved.
    
*   If teardown fails and rows remain in the database, future runs must still pass because all scenario data is uniquely named.