export interface SeedCategory {
  name: string;
  children?: SeedCategory[];
}

export interface SeedQuestion {
  questionType: 'multiple' | 'short' | 'essay';
  content: string;
  correctAnswer: string;
  difficulty: number;
  categoryPath: string[];
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: 'DB',
    children: [{ name: 'SQL' }, { name: 'B+tree' }, { name: 'Hashing' }, { name: 'Sorting' }],
  },
  {
    name: '네트워크',
    children: [{ name: 'TCP/IP' }, { name: 'HTTP' }, { name: 'DNS' }, { name: 'OSI 7계층' }],
  },
];

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ===== DB > SQL =====
  {
    questionType: 'multiple',
    content: 'SELECT 문에서 중복을 제거하는 키워드는?',
    correctAnswer: JSON.stringify({
      options: { A: 'DISTINCT', B: 'UNIQUE', C: 'DIFFERENT', D: 'REMOVE' },
      answer: 'A',
    }),
    difficulty: 1,
    categoryPath: ['DB', 'SQL'],
  },
  {
    questionType: 'multiple',
    content: 'INNER JOIN과 LEFT JOIN의 차이점으로 올바른 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'INNER JOIN은 왼쪽 테이블의 모든 데이터를 반환한다',
        B: 'LEFT JOIN은 양쪽 테이블에 모두 존재하는 데이터만 반환한다',
        C: 'INNER JOIN은 양쪽 테이블에 모두 존재하는 데이터만 반환한다',
        D: '둘은 완전히 동일하다',
      },
      answer: 'C',
    }),
    difficulty: 2,
    categoryPath: ['DB', 'SQL'],
  },
  {
    questionType: 'short',
    content: 'GROUP BY와 HAVING의 역할을 각각 설명하세요.',
    correctAnswer:
      'GROUP BY는 특정 컬럼을 기준으로 데이터를 그룹화하는 절이고, HAVING은 그룹화된 결과에 대해 조건을 적용하는 절입니다. WHERE는 그룹화 전에 조건을 적용하지만, HAVING은 그룹화 후에 조건을 적용합니다.',
    difficulty: 2,
    categoryPath: ['DB', 'SQL'],
  },
  {
    questionType: 'short',
    content: '서브쿼리(Subquery)란 무엇인지 설명하세요.',
    correctAnswer:
      '서브쿼리는 SQL 쿼리 내부에 포함된 또 다른 쿼리로, 메인 쿼리에 결과를 제공합니다. SELECT, FROM, WHERE 절 등에서 사용할 수 있으며, 복잡한 데이터 조회나 조건 처리에 활용됩니다.',
    difficulty: 3,
    categoryPath: ['DB', 'SQL'],
  },
  {
    questionType: 'essay',
    content: '트랜잭션의 ACID 속성을 각각 설명하고, 각 속성이 왜 중요한지 서술하세요.',
    correctAnswer:
      'ACID는 트랜잭션의 4가지 핵심 속성입니다. Atomicity(원자성)는 트랜잭션의 모든 연산이 완전히 수행되거나 전혀 수행되지 않음을 보장하여 데이터 일관성을 유지합니다. Consistency(일관성)는 트랜잭션 전후로 데이터베이스가 일관된 상태를 유지하도록 보장합니다. Isolation(격리성)은 동시에 실행되는 트랜잭션들이 서로 영향을 주지 않도록 격리하여 동시성 제어를 가능하게 합니다. Durability(지속성)은 커밋된 트랜잭션의 결과가 영구적으로 반영되어 시스템 장애 시에도 데이터가 보존되도록 합니다.',
    difficulty: 4,
    categoryPath: ['DB', 'SQL'],
  },
  {
    questionType: 'essay',
    content: '인덱스를 사용했을 때의 장점과 단점을 설명하세요.',
    correctAnswer:
      '인덱스의 장점은 검색 속도가 크게 향상되고, ORDER BY나 GROUP BY 연산의 성능이 개선된다는 것입니다. 특히 WHERE 절에서 자주 사용되는 컬럼에 인덱스를 생성하면 효과적입니다. 단점으로는 인덱스 자체가 추가 저장 공간을 차지하며, INSERT, UPDATE, DELETE 연산 시 인덱스도 함께 수정해야 하므로 쓰기 성능이 저하될 수 있습니다. 따라서 읽기가 많고 쓰기가 적은 테이블에 적합합니다.',
    difficulty: 4,
    categoryPath: ['DB', 'SQL'],
  },

  // ===== DB > B+tree =====
  {
    questionType: 'multiple',
    content: 'B+tree에 대한 설명으로 올바른 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'B+tree는 이진 트리의 일종이다',
        B: 'B+tree의 모든 데이터는 리프 노드에만 저장된다',
        C: 'B+tree는 균형을 유지하지 않는다',
        D: 'B+tree는 검색만 가능하고 삽입은 불가능하다',
      },
      answer: 'B',
    }),
    difficulty: 2,
    categoryPath: ['DB', 'B+tree'],
  },
  {
    questionType: 'multiple',
    content: 'B+tree에서 검색의 시간 복잡도는?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'O(1)',
        B: 'O(log n)',
        C: 'O(n)',
        D: 'O(n log n)',
      },
      answer: 'B',
    }),
    difficulty: 3,
    categoryPath: ['DB', 'B+tree'],
  },
  {
    questionType: 'short',
    content: 'B+tree와 B-tree의 차이점을 설명하세요.',
    correctAnswer:
      'B+tree는 모든 데이터를 리프 노드에만 저장하고, 내부 노드는 인덱스 역할만 합니다. 또한 리프 노드들이 연결 리스트로 연결되어 범위 검색에 유리합니다. 반면 B-tree는 내부 노드에도 데이터를 저장합니다.',
    difficulty: 4,
    categoryPath: ['DB', 'B+tree'],
  },
  {
    questionType: 'short',
    content: 'B+tree가 데이터베이스 인덱스로 많이 사용되는 이유를 설명하세요.',
    correctAnswer:
      'B+tree는 균형 잡힌 구조로 검색, 삽입, 삭제가 모두 O(log n) 시간에 가능하며, 디스크 I/O를 최소화하는 구조입니다. 또한 리프 노드가 연결되어 있어 범위 검색에 효율적이고, 순차 접근 성능이 뛰어나기 때문입니다.',
    difficulty: 3,
    categoryPath: ['DB', 'B+tree'],
  },
  {
    questionType: 'essay',
    content: 'B+tree의 삽입 알고리즘을 설명하고, split 과정을 서술하세요.',
    correctAnswer:
      'B+tree 삽입 시 먼저 적절한 리프 노드를 찾아 키를 추가합니다. 리프 노드가 최대 키 개수를 초과하면 split이 발생합니다. Split 시 중간 키를 기준으로 노드를 둘로 나누고, 중간 키를 부모 노드로 올립니다. 부모 노드도 오버플로우되면 재귀적으로 split을 수행하며, 루트 노드가 split되면 새로운 루트를 생성하여 트리의 높이가 1 증가합니다. 리프 노드는 데이터와 함께 형제 노드로의 포인터도 유지해야 합니다.',
    difficulty: 5,
    categoryPath: ['DB', 'B+tree'],
  },
  {
    questionType: 'essay',
    content: 'B+tree의 삭제 알고리즘을 설명하고, underflow 처리 방법을 서술하세요.',
    correctAnswer:
      'B+tree 삭제 시 리프 노드에서 키를 제거합니다. 노드의 키 개수가 최소값 미만으로 떨어지면 underflow가 발생합니다. 이때 형제 노드에서 키를 빌려오는 redistribution을 시도하고, 불가능하면 형제 노드와 merge합니다. Merge 시 부모 노드의 키도 함께 내려오며, 부모에서도 underflow가 발생하면 재귀적으로 처리합니다. 루트까지 merge되면 트리의 높이가 1 감소합니다.',
    difficulty: 5,
    categoryPath: ['DB', 'B+tree'],
  },

  // ===== DB > Hashing =====
  {
    questionType: 'multiple',
    content: '해시 테이블의 평균 검색 시간 복잡도는?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'O(1)',
        B: 'O(log n)',
        C: 'O(n)',
        D: 'O(n^2)',
      },
      answer: 'A',
    }),
    difficulty: 2,
    categoryPath: ['DB', 'Hashing'],
  },
  {
    questionType: 'multiple',
    content: '해시 충돌(Hash Collision) 해결 방법이 아닌 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'Chaining',
        B: 'Open Addressing',
        C: 'Binary Search',
        D: 'Double Hashing',
      },
      answer: 'C',
    }),
    difficulty: 3,
    categoryPath: ['DB', 'Hashing'],
  },
  {
    questionType: 'short',
    content: 'Chaining 방식의 해시 충돌 해결 방법을 설명하세요.',
    correctAnswer:
      'Chaining은 같은 해시 값을 가진 키들을 연결 리스트로 관리하는 방식입니다. 각 해시 버킷에 연결 리스트를 두고, 충돌 발생 시 해당 리스트에 노드를 추가합니다. 검색 시에는 해시 값으로 버킷을 찾은 후 리스트를 순회하여 키를 찾습니다.',
    difficulty: 3,
    categoryPath: ['DB', 'Hashing'],
  },
  {
    questionType: 'short',
    content: 'Open Addressing 방식의 해시 충돌 해결 방법을 설명하세요.',
    correctAnswer:
      'Open Addressing은 충돌 발생 시 다른 빈 버킷을 찾아 저장하는 방식입니다. 선형 탐사(Linear Probing), 제곱 탐사(Quadratic Probing), 이중 해싱(Double Hashing) 등의 방법으로 다음 버킷을 결정합니다. 모든 데이터가 테이블 내부에 저장되므로 추가 메모리가 필요 없습니다.',
    difficulty: 3,
    categoryPath: ['DB', 'Hashing'],
  },
  {
    questionType: 'essay',
    content:
      '좋은 해시 함수의 조건을 설명하고, 해시 테이블의 Load Factor가 성능에 미치는 영향을 서술하세요.',
    correctAnswer:
      '좋은 해시 함수는 첫째, 계산이 빠르고 간단해야 하며, 둘째, 키들을 해시 테이블 전체에 균등하게 분산시켜야 합니다(uniform distribution). 셋째, 충돌을 최소화해야 합니다. Load Factor는 테이블 크기 대비 저장된 키의 비율로, 값이 높아질수록 충돌 확률이 증가하여 성능이 저하됩니다. Chaining의 경우 Load Factor가 1을 초과해도 동작하지만 검색 시간이 O(n)에 가까워지고, Open Addressing은 Load Factor가 높아지면 빈 슬롯 찾기가 어려워져 성능이 급격히 저하됩니다. 일반적으로 Load Factor가 0.7-0.75를 넘으면 테이블 크기를 늘리는 rehashing을 수행합니다.',
    difficulty: 5,
    categoryPath: ['DB', 'Hashing'],
  },
  {
    questionType: 'essay',
    content: '데이터베이스에서 해시 인덱스와 B+tree 인덱스를 비교하고, 각각의 장단점을 설명하세요.',
    correctAnswer:
      '해시 인덱스는 등호(=) 검색에서 O(1)의 매우 빠른 성능을 제공하지만, 범위 검색이나 정렬된 순서 접근이 불가능합니다. 또한 해시 충돌과 Load Factor 관리가 필요하며, 동적 크기 조정 시 rehashing 비용이 큽니다. B+tree 인덱스는 O(log n) 성능으로 약간 느리지만, 범위 검색과 정렬된 순회가 가능하고, 부분 일치 검색(LIKE)도 지원합니다. 또한 균형 잡힌 구조로 최악의 경우에도 안정적인 성능을 보장합니다. 따라서 등호 검색만 필요한 경우 해시 인덱스가, 다양한 검색 패턴이 필요한 경우 B+tree 인덱스가 적합합니다.',
    difficulty: 5,
    categoryPath: ['DB', 'Hashing'],
  },

  // ===== DB > Sorting =====
  {
    questionType: 'multiple',
    content: 'Quick Sort의 평균 시간 복잡도는?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'O(n)',
        B: 'O(n log n)',
        C: 'O(n^2)',
        D: 'O(log n)',
      },
      answer: 'B',
    }),
    difficulty: 2,
    categoryPath: ['DB', 'Sorting'],
  },
  {
    questionType: 'multiple',
    content: '안정 정렬(Stable Sort) 알고리즘이 아닌 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'Merge Sort',
        B: 'Insertion Sort',
        C: 'Quick Sort',
        D: 'Bubble Sort',
      },
      answer: 'C',
    }),
    difficulty: 3,
    categoryPath: ['DB', 'Sorting'],
  },
  {
    questionType: 'short',
    content: '안정 정렬(Stable Sort)이란 무엇인지 설명하세요.',
    correctAnswer:
      '안정 정렬은 같은 값을 가진 요소들의 상대적인 순서가 정렬 후에도 유지되는 정렬 알고리즘입니다. 예를 들어, (3,a), (1,b), (3,c)를 정렬할 때 결과가 (1,b), (3,a), (3,c)가 되면 안정 정렬입니다.',
    difficulty: 2,
    categoryPath: ['DB', 'Sorting'],
  },
  {
    questionType: 'short',
    content: '데이터베이스에서 외부 정렬(External Sort)이 필요한 이유를 설명하세요.',
    correctAnswer:
      '외부 정렬은 정렬해야 할 데이터가 메모리보다 클 때 사용하는 정렬 방법입니다. 데이터베이스에서 대용량 테이블을 정렬할 때 모든 데이터를 메모리에 올릴 수 없으므로, 디스크를 활용한 외부 정렬이 필요합니다. 일반적으로 Merge Sort 기반의 다단계 병합을 사용합니다.',
    difficulty: 4,
    categoryPath: ['DB', 'Sorting'],
  },
  {
    questionType: 'essay',
    content: 'Merge Sort의 동작 원리를 설명하고, 시간 복잡도를 분석하세요.',
    correctAnswer:
      'Merge Sort는 분할 정복(Divide and Conquer) 알고리즘입니다. 배열을 재귀적으로 반으로 나누어 크기가 1이 될 때까지 분할한 후, 두 개의 정렬된 부분 배열을 병합하면서 전체를 정렬합니다. 병합 과정에서 두 배열의 앞에서부터 비교하며 작은 값을 결과 배열에 추가합니다. 분할 단계는 log n 레벨이며, 각 레벨에서 병합에 O(n) 시간이 소요되므로 전체 시간 복잡도는 O(n log n)입니다. 최선, 평균, 최악 모두 O(n log n)으로 일정하며, 안정 정렬이라는 장점이 있습니다. 단점은 O(n)의 추가 공간이 필요하다는 것입니다.',
    difficulty: 4,
    categoryPath: ['DB', 'Sorting'],
  },
  {
    questionType: 'essay',
    content: 'Quick Sort의 동작 원리를 설명하고, 최악의 경우를 피하는 방법을 서술하세요.',
    correctAnswer:
      'Quick Sort는 pivot을 선택하여 pivot보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 분할한 후 재귀적으로 정렬하는 알고리즘입니다. 평균적으로 O(n log n)의 빠른 성능을 보이지만, pivot 선택이 나쁘면 O(n^2)까지 느려질 수 있습니다. 최악의 경우를 피하기 위한 방법으로는 첫째, 랜덤하게 pivot을 선택하거나, 둘째, median-of-three 방식으로 첫 번째, 중간, 마지막 원소의 중간값을 pivot으로 선택하는 방법이 있습니다. 또한 작은 부분 배열에서는 Insertion Sort로 전환하여 성능을 개선할 수 있습니다. Quick Sort는 제자리 정렬(in-place)로 추가 메모리가 적게 필요하지만 불안정 정렬입니다.',
    difficulty: 5,
    categoryPath: ['DB', 'Sorting'],
  },

  // ===== 네트워크 > TCP/IP =====
  {
    questionType: 'multiple',
    content: 'TCP 3-way handshake의 올바른 순서는?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'SYN → ACK → FIN',
        B: 'SYN → SYN-ACK → ACK',
        C: 'SYN → ACK → SYN',
        D: 'ACK → SYN → ACK',
      },
      answer: 'B',
    }),
    difficulty: 2,
    categoryPath: ['네트워크', 'TCP/IP'],
  },
  {
    questionType: 'multiple',
    content: 'TCP와 UDP의 차이점으로 올바르지 않은 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'TCP는 연결 지향, UDP는 비연결 지향이다',
        B: 'TCP는 신뢰성을 보장하고, UDP는 보장하지 않는다',
        C: 'TCP는 순서를 보장하고, UDP는 보장하지 않는다',
        D: 'TCP가 UDP보다 항상 빠르다',
      },
      answer: 'D',
    }),
    difficulty: 2,
    categoryPath: ['네트워크', 'TCP/IP'],
  },
  {
    questionType: 'short',
    content: 'TCP의 흐름 제어(Flow Control)가 필요한 이유를 설명하세요.',
    correctAnswer:
      '흐름 제어는 송신자가 수신자의 처리 속도보다 빠르게 데이터를 보내지 않도록 조절하는 메커니즘입니다. 수신자의 버퍼가 넘치는 것을 방지하여 데이터 손실을 막고, 수신자가 처리할 수 있는 속도로 데이터를 전송하도록 합니다. TCP는 슬라이딩 윈도우(Sliding Window)를 사용하여 흐름 제어를 수행합니다.',
    difficulty: 3,
    categoryPath: ['네트워크', 'TCP/IP'],
  },
  {
    questionType: 'short',
    content: 'TCP의 혼잡 제어(Congestion Control)가 필요한 이유를 설명하세요.',
    correctAnswer:
      '혼잡 제어는 네트워크의 혼잡 상황을 감지하고 송신 속도를 조절하여 네트워크 붕괴를 방지하는 메커니즘입니다. 네트워크에 과도한 데이터가 전송되면 라우터의 버퍼가 넘치고 패킷 손실이 발생하며, 이는 재전송을 유발하여 혼잡을 더욱 악화시킵니다. TCP는 Slow Start, Congestion Avoidance 등의 알고리즘으로 혼잡 제어를 수행합니다.',
    difficulty: 3,
    categoryPath: ['네트워크', 'TCP/IP'],
  },
  {
    questionType: 'essay',
    content:
      'TCP의 3-way handshake와 4-way handshake를 각각 설명하고, 왜 연결 종료 시에는 4단계가 필요한지 서술하세요.',
    correctAnswer:
      '3-way handshake는 TCP 연결 수립 과정으로, 클라이언트가 SYN을 보내고, 서버가 SYN-ACK로 응답하며, 클라이언트가 ACK를 보내 연결이 수립됩니다. 4-way handshake는 연결 종료 과정으로, 클라이언트가 FIN을 보내고, 서버가 ACK로 응답한 후, 서버가 FIN을 보내고, 클라이언트가 ACK로 응답합니다. 연결 종료 시 4단계가 필요한 이유는 TCP가 전이중(Full-Duplex) 통신이기 때문입니다. 한쪽이 데이터 전송을 종료해도 상대방은 아직 보낼 데이터가 남아있을 수 있으므로, 양방향 연결을 각각 독립적으로 종료해야 합니다. 따라서 각 방향의 FIN과 ACK가 필요하여 총 4단계가 됩니다.',
    difficulty: 4,
    categoryPath: ['네트워크', 'TCP/IP'],
  },
  {
    questionType: 'essay',
    content: 'TCP의 재전송 메커니즘을 설명하고, Timeout과 Fast Retransmit의 차이를 서술하세요.',
    correctAnswer:
      'TCP는 신뢰성 있는 통신을 위해 ACK를 받지 못한 세그먼트를 재전송합니다. Timeout 기반 재전송은 RTT(Round Trip Time)를 기반으로 계산된 타이머가 만료되면 세그먼트를 재전송하는 방식입니다. RTO(Retransmission Timeout)는 동적으로 조정되며, 네트워크 상황에 따라 변합니다. Fast Retransmit은 3개의 중복 ACK를 받으면 타이머 만료를 기다리지 않고 즉시 재전송하는 방식입니다. 중복 ACK는 순서가 틀린 세그먼트가 도착했음을 의미하며, 이는 패킷 손실의 강력한 신호입니다. Fast Retransmit은 Timeout보다 빠르게 손실을 복구하여 처리량을 향상시킵니다. 두 메커니즘은 함께 사용되어 다양한 손실 시나리오에 대응합니다.',
    difficulty: 5,
    categoryPath: ['네트워크', 'TCP/IP'],
  },

  // ===== 네트워크 > HTTP =====
  {
    questionType: 'multiple',
    content: 'HTTP 메서드 중 멱등성(Idempotent)을 보장하지 않는 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'GET',
        B: 'PUT',
        C: 'DELETE',
        D: 'POST',
      },
      answer: 'D',
    }),
    difficulty: 3,
    categoryPath: ['네트워크', 'HTTP'],
  },
  {
    questionType: 'multiple',
    content: 'HTTP 상태 코드 중 리다이렉션을 나타내는 범위는?',
    correctAnswer: JSON.stringify({
      options: {
        A: '2xx',
        B: '3xx',
        C: '4xx',
        D: '5xx',
      },
      answer: 'B',
    }),
    difficulty: 1,
    categoryPath: ['네트워크', 'HTTP'],
  },
  {
    questionType: 'short',
    content: 'HTTP의 무상태(Stateless) 특징을 설명하세요.',
    correctAnswer:
      'HTTP는 무상태 프로토콜로, 서버가 클라이언트의 이전 요청 정보를 저장하지 않습니다. 각 요청은 독립적으로 처리되며, 클라이언트 상태를 유지하려면 쿠키나 세션 같은 별도의 메커니즘이 필요합니다. 이는 서버의 확장성을 높이지만, 상태 관리가 필요한 애플리케이션에서는 추가 구현이 필요합니다.',
    difficulty: 2,
    categoryPath: ['네트워크', 'HTTP'],
  },
  {
    questionType: 'short',
    content: 'GET과 POST 메서드의 차이점을 설명하세요.',
    correctAnswer:
      'GET은 리소스를 조회하는 메서드로 데이터를 URL의 쿼리 스트링에 포함시키며, 멱등성과 안전성을 보장합니다. 브라우저에서 캐싱되고 북마크 가능합니다. POST는 리소스를 생성하거나 데이터를 제출하는 메서드로 데이터를 요청 본문(body)에 포함시키며, 멱등성을 보장하지 않습니다. 캐싱되지 않고 브라우저 히스토리에 남지 않습니다.',
    difficulty: 2,
    categoryPath: ['네트워크', 'HTTP'],
  },
  {
    questionType: 'essay',
    content: 'HTTP/1.1과 HTTP/2의 주요 차이점을 설명하고, HTTP/2의 성능 개선 기법을 서술하세요.',
    correctAnswer:
      'HTTP/1.1은 텍스트 기반 프로토콜로 한 번에 하나의 요청만 처리할 수 있어 HOL(Head-of-Line) Blocking 문제가 발생합니다. HTTP/2는 이를 개선하기 위해 바이너리 프레이밍 계층을 도입하고, 다중화(Multiplexing)를 지원하여 하나의 연결에서 여러 요청을 동시에 처리합니다. 또한 서버 푸시(Server Push)로 클라이언트 요청 전에 필요한 리소스를 미리 전송하고, 헤더 압축(HPACK)으로 중복 헤더를 제거하여 대역폭을 절약합니다. 스트림 우선순위 지정으로 중요한 리소스를 먼저 전송할 수 있습니다. 이러한 개선으로 HTTP/2는 페이지 로딩 속도가 크게 향상되었습니다.',
    difficulty: 4,
    categoryPath: ['네트워크', 'HTTP'],
  },
  {
    questionType: 'essay',
    content: 'HTTPS의 동작 원리를 설명하고, SSL/TLS 핸드셰이크 과정을 서술하세요.',
    correctAnswer:
      'HTTPS는 HTTP에 SSL/TLS 계층을 추가하여 데이터를 암호화하는 프로토콜입니다. SSL/TLS 핸드셰이크는 다음과 같이 진행됩니다. 1) 클라이언트가 Client Hello를 보내며 지원하는 암호화 방식을 전달합니다. 2) 서버가 Server Hello로 응답하며 사용할 암호화 방식을 선택하고 인증서를 전송합니다. 3) 클라이언트가 인증서를 검증하고, 공개키로 암호화한 pre-master secret을 서버에 전송합니다. 4) 양측이 pre-master secret으로 세션 키를 생성하고, Finished 메시지를 교환하여 핸드셰이크를 완료합니다. 이후 세션 키로 대칭키 암호화 통신을 진행합니다. HTTPS는 데이터 기밀성, 무결성, 서버 인증을 제공하여 중간자 공격을 방지합니다.',
    difficulty: 5,
    categoryPath: ['네트워크', 'HTTP'],
  },

  // ===== 네트워크 > DNS =====
  {
    questionType: 'multiple',
    content: 'DNS가 사용하는 기본 포트 번호는?',
    correctAnswer: JSON.stringify({
      options: {
        A: '80',
        B: '443',
        C: '53',
        D: '8080',
      },
      answer: 'C',
    }),
    difficulty: 1,
    categoryPath: ['네트워크', 'DNS'],
  },
  {
    questionType: 'multiple',
    content: 'DNS 레코드 타입 중 IPv4 주소를 나타내는 것은?',
    correctAnswer: JSON.stringify({
      options: {
        A: 'A',
        B: 'AAAA',
        C: 'CNAME',
        D: 'MX',
      },
      answer: 'A',
    }),
    difficulty: 2,
    categoryPath: ['네트워크', 'DNS'],
  },
  {
    questionType: 'short',
    content: 'DNS의 주요 역할을 설명하세요.',
    correctAnswer:
      'DNS(Domain Name System)는 사람이 읽을 수 있는 도메인 이름(예: www.example.com)을 컴퓨터가 사용하는 IP 주소(예: 192.0.2.1)로 변환하는 시스템입니다. 분산 데이터베이스 구조로 전 세계적으로 운영되며, 계층적 구조로 효율적인 이름 해석을 제공합니다.',
    difficulty: 1,
    categoryPath: ['네트워크', 'DNS'],
  },
  {
    questionType: 'short',
    content: 'DNS 캐싱의 목적과 장점을 설명하세요.',
    correctAnswer:
      'DNS 캐싱은 한 번 조회한 도메인의 IP 주소를 일정 시간 동안 저장하여 재사용하는 메커니즘입니다. 이를 통해 DNS 서버에 대한 반복적인 쿼리를 줄여 네트워크 트래픽을 감소시키고, 응답 속도를 향상시키며, DNS 서버의 부하를 줄입니다. TTL(Time To Live) 값에 따라 캐시 유효 시간이 결정됩니다.',
    difficulty: 2,
    categoryPath: ['네트워크', 'DNS'],
  },
  {
    questionType: 'essay',
    content:
      'DNS 쿼리의 두 가지 방식인 재귀적 쿼리(Recursive Query)와 반복적 쿼리(Iterative Query)를 비교 설명하세요.',
    correctAnswer:
      '재귀적 쿼리는 클라이언트가 DNS 리졸버에게 완전한 답변을 요청하는 방식입니다. 리졸버는 여러 DNS 서버에 쿼리를 보내 최종 IP 주소를 찾아 클라이언트에게 반환합니다. 클라이언트는 하나의 요청만 보내고 결과를 받으므로 편리하지만, 리졸버의 부담이 큽니다. 반복적 쿼리는 각 DNS 서버가 자신이 알고 있는 최선의 정보만 반환하는 방식입니다. 클라이언트(또는 리졸버)는 여러 서버에 순차적으로 쿼리를 보내며 답을 찾아갑니다. 일반적으로 클라이언트와 로컬 리졸버 간에는 재귀적 쿼리를, 리졸버와 다른 DNS 서버 간에는 반복적 쿼리를 사용합니다.',
    difficulty: 4,
    categoryPath: ['네트워크', 'DNS'],
  },
  {
    questionType: 'essay',
    content: 'DNS의 계층 구조를 설명하고, 도메인 이름 해석 과정을 단계별로 서술하세요.',
    correctAnswer:
      'DNS는 트리 구조의 계층적 시스템입니다. 최상위에 루트(Root) 서버가 있고, 그 아래 TLD(Top-Level Domain) 서버(.com, .org, .kr 등), 그리고 권한 있는(Authoritative) 네임 서버 순으로 구성됩니다. 도메인 이름 해석 과정은 다음과 같습니다. 1) 클라이언트가 www.example.com을 조회하면 로컬 리졸버에 재귀적 쿼리를 보냅니다. 2) 리졸버는 루트 서버에 쿼리하여 .com TLD 서버 주소를 받습니다. 3) .com TLD 서버에 쿼리하여 example.com의 권한 있는 네임 서버 주소를 받습니다. 4) 해당 네임 서버에 쿼리하여 최종 IP 주소를 받습니다. 5) 리졸버가 클라이언트에게 IP 주소를 반환하고, 각 단계의 결과를 TTL에 따라 캐싱합니다. 이 계층 구조는 전 세계적인 확장성과 분산 관리를 가능하게 합니다.',
    difficulty: 5,
    categoryPath: ['네트워크', 'DNS'],
  },

  // ===== 네트워크 > OSI 7계층 =====
  {
    questionType: 'multiple',
    content: 'OSI 7계층 모델에서 전송 계층(Transport Layer)은 몇 번째 계층인가?',
    correctAnswer: JSON.stringify({
      options: {
        A: '3계층',
        B: '4계층',
        C: '5계층',
        D: '6계층',
      },
      answer: 'B',
    }),
    difficulty: 1,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
  {
    questionType: 'multiple',
    content: '라우터(Router)가 동작하는 OSI 계층은?',
    correctAnswer: JSON.stringify({
      options: {
        A: '1계층 (물리 계층)',
        B: '2계층 (데이터 링크 계층)',
        C: '3계층 (네트워크 계층)',
        D: '4계층 (전송 계층)',
      },
      answer: 'C',
    }),
    difficulty: 2,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
  {
    questionType: 'short',
    content: 'OSI 7계층 모델의 각 계층 이름을 순서대로 나열하세요.',
    correctAnswer:
      '1계층: 물리 계층(Physical Layer), 2계층: 데이터 링크 계층(Data Link Layer), 3계층: 네트워크 계층(Network Layer), 4계층: 전송 계층(Transport Layer), 5계층: 세션 계층(Session Layer), 6계층: 표현 계층(Presentation Layer), 7계층: 응용 계층(Application Layer)',
    difficulty: 1,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
  {
    questionType: 'short',
    content: '데이터 링크 계층(Layer 2)의 주요 역할을 설명하세요.',
    correctAnswer:
      '데이터 링크 계층은 물리적으로 연결된 노드 간의 신뢰성 있는 데이터 전송을 담당합니다. MAC 주소를 사용하여 프레임을 전달하고, 오류 검출 및 수정, 흐름 제어를 수행합니다. 이더넷, Wi-Fi, PPP 등이 이 계층에서 동작하며, 스위치가 대표적인 2계층 장비입니다.',
    difficulty: 2,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
  {
    questionType: 'essay',
    content: 'OSI 7계층 모델과 TCP/IP 4계층 모델을 비교하고, 각 모델의 장단점을 설명하세요.',
    correctAnswer:
      'OSI 7계층 모델은 네트워크 통신을 7개의 논리적 계층으로 세분화한 이론적 모델입니다. 물리, 데이터 링크, 네트워크, 전송, 세션, 표현, 응용 계층으로 구성되며, 각 계층이 명확히 분리되어 교육과 표준화에 유용합니다. TCP/IP 4계층 모델은 실제 인터넷에서 사용되는 실용적 모델로, 네트워크 인터페이스, 인터넷, 전송, 응용 계층으로 구성됩니다. OSI의 세션, 표현, 응용 계층이 TCP/IP에서는 응용 계층으로 통합되었습니다. OSI 모델은 개념적으로 완성도가 높고 각 계층의 역할이 명확하지만 복잡하고 실제 구현과 차이가 있습니다. TCP/IP 모델은 실용적이고 간결하며 실제 인터넷 프로토콜과 일치하지만, 계층 분리가 덜 명확합니다. 현대 네트워크는 TCP/IP 모델을 따르지만, OSI 모델은 네트워크 개념 설명과 문제 진단에 여전히 활용됩니다.',
    difficulty: 4,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
  {
    questionType: 'essay',
    content: '캡슐화(Encapsulation)와 역캡슐화(Decapsulation) 과정을 OSI 계층별로 설명하세요.',
    correctAnswer:
      '캡슐화는 송신 측에서 데이터가 상위 계층에서 하위 계층으로 내려가며 각 계층의 헤더(또는 트레일러)가 추가되는 과정입니다. 7계층(응용)에서 사용자 데이터가 생성되고, 6계층(표현)에서 데이터 형식 변환 및 암호화가 이루어집니다. 5계층(세션)에서 세션 정보가 추가되고, 4계층(전송)에서 TCP/UDP 헤더가 붙어 세그먼트가 됩니다. 3계층(네트워크)에서 IP 헤더가 추가되어 패킷이 되고, 2계층(데이터 링크)에서 MAC 헤더와 트레일러가 추가되어 프레임이 됩니다. 마지막으로 1계층(물리)에서 비트 스트림으로 변환되어 전송됩니다. 역캡슐화는 수신 측에서 하위 계층부터 순차적으로 헤더를 제거하며 데이터를 추출하는 과정으로, 각 계층에서 해당 계층의 헤더를 해석하고 제거한 후 상위 계층으로 전달합니다. 이 과정을 통해 계층 간 독립성이 유지되고 모듈화된 네트워크 구조가 가능해집니다.',
    difficulty: 5,
    categoryPath: ['네트워크', 'OSI 7계층'],
  },
];
