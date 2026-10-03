<?php
declare(strict_types=1);

namespace ESN\Proposals\Repository;

use PDO;

final readonly class ProposalsRepository {

    public function __construct(
        private PDO $connection
    ) {}

    public function list(): array {
        $stmt = $this->connection->prepare('
            SELECT *
            FROM proposals
            ORDER BY created_at DESC   
        ');

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}