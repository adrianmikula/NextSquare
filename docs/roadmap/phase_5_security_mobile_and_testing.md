


Add a launch mode called demo which activates square's built-in demo sandbox, and also generates/mocks fake dummy menu items for testing.  Should support the full menu -> cart -> order -> POS -> fulfillment lifecycle.

Also use the logic from the claude skill located in the repo at https://github.com/adrianmikula/AgentSkills/tree/main/ai-era-vulnerability-scanner to scan the full webapp for AI_era security gaps, and document them under docs/techdebt

also, i want to review the error handling and logging, and ensure all errors are logged (not silenced), and the UI shows intuitive, user-friendly Toast-style error messages.

lets also ensure the design is set up to work on mobile devices with responsive CSS styling and a standard, pop-out mobile menu. 

also review the code complexity and consistency.  Eliminate code duplication, share common code, rewrite complicated methods simpler if possible, and ensure the code is readable, understandable, and wasy to maintain.  Split up any large source code files (longer than 500 lines), and aim to reduce the code length by 50% (soft target). 

also, we don't want to add fallback logic anywhere in the code (expect for cases like special 'demo' flags). add this principle under docs/patterns. wrong config should throw a meaningful error back to the developer or user .  we should also expand config tests to cover scenarios like correct error handling for misconfigured env vars

_Remaining security hardening work has been moved to `docs/roadmap/phase_7_security_hardening.md`_


