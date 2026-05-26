from orchestration.agent_router import AgentRouter


def test_router_finds_macro_tools():
    router = AgentRouter()
    recs = router.recommend_tools("What is the Taylor rule implied rate for inflation?")
    assert any(r.category == "macro" for r in recs)
    assert recs[0].score > 0


def test_router_credit_default():
    router = AgentRouter()
    primary = router.resolve_primary_tool("Merton structural default probability")
    assert primary is not None
    assert primary.category == "credit"


def test_tool_chain_diversifies_categories():
    router = AgentRouter()
    chain = router.plan_tool_chain("macro recession and equity rsi technicals", max_steps=3)
    categories = {c.category for c in chain}
    assert len(categories) >= 2
