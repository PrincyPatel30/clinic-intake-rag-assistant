"""
Reciprocal Rank Fusion (RRF) at k=60
Used to fuse sparse lexical scores (BM25) and dense embedding ranks without score scale distortion.
"""

from typing import List, Dict, Any

def reciprocal_rank_fusion(
    bm25_ranked_ids: List[str],
    dense_ranked_ids: List[str],
    k: int = 60
) -> List[Dict[str, Any]]:
    """
    Fuses two ranked lists using RRF formula:
    score(d) = sum(1 / (k + rank_i(d)))
    """
    scores: Dict[str, float] = {}
    rank_details: Dict[str, Dict[str, int]] = {}

    # Accumulate BM25 ranks (1-indexed)
    for rank, doc_id in enumerate(bm25_ranked_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
        if doc_id not in rank_details:
            rank_details[doc_id] = {}
        rank_details[doc_id]["bm25_rank"] = rank

    # Accumulate Dense ranks (1-indexed)
    for rank, doc_id in enumerate(dense_ranked_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
        if doc_id not in rank_details:
            rank_details[doc_id] = {}
        rank_details[doc_id]["dense_rank"] = rank

    # Sort items descending by fused score
    sorted_items = sorted(scores.items(), key=lambda item: item[1], reverse=True)

    fused_results = []
    for final_rank, (doc_id, fused_score) in enumerate(sorted_items, start=1):
        fused_results.append({
            "doc_id": doc_id,
            "rrf_score": round(fused_score, 6),
            "final_rank": final_rank,
            "bm25_rank": rank_details[doc_id].get("bm25_rank", len(bm25_ranked_ids) + 1),
            "dense_rank": rank_details[doc_id].get("dense_rank", len(dense_ranked_ids) + 1),
        })

    return fused_results

if __name__ == "__main__":
    bm25_list = ["CARD-CHEST-LOC", "CARD-CHEST-RAD", "CARD-SEV-SCALE"]
    dense_list = ["CARD-CHEST-RAD", "CARD-CHEST-LOC", "CARD-DYSPNEA-ORTHO"]

    fused = reciprocal_rank_fusion(bm25_list, dense_list, k=60)
    assert len(fused) == 4, "Fused output length mismatch"
    print("RRF Fusion test passed. Top item:", fused[0])
