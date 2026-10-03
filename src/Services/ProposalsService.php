<?php
declare(strict_types=1);

namespace ESN\Proposals\Services;

use ESN\Proposals\Repository\ProposalsRepository;

final readonly class ProposalsService {

    public function __construct(
        private ProposalsRepository $proposalsRepository
    ) {}

    public function list(): array {
        return $this->proposalsRepository->list();
    }
}