<?php
declare(strict_types=1);

namespace ESN\Proposals\Controllers;

use ESN\Proposals\Core\Response;
use ESN\Proposals\Services\ProposalsService;
use JsonException;

final readonly class ProposalsController {

    public function __construct(
        private ProposalsService $proposalsService
    ) {}


    /**
     * @throws JsonException
     */
    public function list(): void {
        $items = $this->proposalsService->list();
        Response::json($items);
    }

//    public function create(): void {
//        $createdId = $this->proposalsService->create(/* read body */);
//        Response::json(['id' => $createdId], 201);
//    }
//
//    public function edit(): void {
//        $this->proposalsService->edit();
//        Response::json(null, 204);
//    }
//
//    public function delete(): void {
//        $this->proposalsService->delete();
//        Response::json(null, 204);
//    }
//
//    public function highlight(): void {
//        $this->proposalsService->highlight();
//        Response::json(null, 204);
//    }
//
//    public function lock(): void {
//        $this->proposalsService->lock();
//        Response::json(null, 204);
//    }
//
//    public function support(): void {
//        $this->proposalsService->support();
//        Response::json(null, 204);
//    }
//
//    public function unsupported(): void {
//        $this->proposalsService->unsupported();
//        Response::json(null, 204);
//    }
//
//    public function checkSupport(): void {
//        $supported = $this->proposalsService->checkSupport(/* proposalId, userId */);
//        Response::json(['supported' => $supported], 200);
//    }
}