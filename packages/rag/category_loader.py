from dataclasses import dataclass
from typing import Optional
from db import get_connection, get_cursor


@dataclass
class CategoryInfo:
    id: int
    name: str
    path: str
    question_count: int


def get_category_path(category_id: int) -> str:
    """재귀 쿼리로 카테고리의 전체 경로를 가져옴"""
    query = """
    WITH RECURSIVE category_path AS (
        SELECT id, name, parent_id, name::text as path
        FROM categories
        WHERE id = %s

        UNION ALL

        SELECT c.id, c.name, c.parent_id, c.name || ' > ' || cp.path
        FROM categories c
        INNER JOIN category_path cp ON c.id = cp.parent_id
    )
    SELECT path FROM category_path
    WHERE parent_id IS NULL
    """
    with get_connection() as conn:
        with get_cursor(conn) as cursor:
            cursor.execute(query, (category_id,))
            result = cursor.fetchone()
            return result["path"] if result else ""


def get_leaf_category_with_least_questions() -> Optional[CategoryInfo]:
    """문제 수가 가장 적은 leaf 카테고리 중 하나를 랜덤 선정"""
    query = """
    WITH min_count AS (
        SELECT MIN(question_count) as min_q
        FROM categories
        WHERE is_leaf = TRUE AND status = 'active'
    )
    SELECT c.id, c.name, c.question_count
    FROM categories c, min_count mc
    WHERE c.is_leaf = TRUE AND c.status = 'active'
      AND c.question_count = mc.min_q
    ORDER BY RANDOM()
    LIMIT 1
    """
    with get_connection() as conn:
        with get_cursor(conn) as cursor:
            cursor.execute(query)
            result = cursor.fetchone()

            if not result:
                return None

            path = get_category_path(result["id"])

            return CategoryInfo(
                id=result["id"],
                name=result["name"],
                path=path,
                question_count=result["question_count"]
            )


def get_all_leaf_categories_stats() -> list[dict]:
    """모든 leaf 카테고리의 문제 수 통계 조회 (검증용)"""
    query = """
    SELECT id, name, question_count
    FROM categories
    WHERE is_leaf = TRUE AND status = 'active'
    ORDER BY question_count ASC, name ASC
    """
    with get_connection() as conn:
        with get_cursor(conn) as cursor:
            cursor.execute(query)
            return list(cursor.fetchall())


if __name__ == "__main__":
    print("=== Category Loader 검증 ===\n")

    # 1. 전체 leaf 카테고리 통계
    print("1. Leaf 카테고리별 문제 수 통계:")
    stats = get_all_leaf_categories_stats()
    for stat in stats[:10]:  # 상위 10개만 출력
        print(f"   - {stat['name']}: {stat['question_count']}개")
    if len(stats) > 10:
        print(f"   ... 외 {len(stats) - 10}개")
    print(f"\n   총 {len(stats)}개의 leaf 카테고리")

    # 2. 문제 수가 가장 적은 카테고리 선정
    print("\n2. 선정된 카테고리:")
    category = get_leaf_category_with_least_questions()
    if category:
        print(f"   ID: {category.id}")
        print(f"   이름: {category.name}")
        print(f"   경로: {category.path}")
        print(f"   현재 문제 수: {category.question_count}")
    else:
        print("   선정된 카테고리가 없습니다.")
