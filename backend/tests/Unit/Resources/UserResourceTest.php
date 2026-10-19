<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use PHPUnit\Framework\TestCase;

class UserResourceTest extends TestCase {
    public function test_it_exposes_only_public_user_fields(): void {
        $user = new User;
        $user->setRawAttributes([
            'id' => 7,
            'name' => 'Miquel Pons',
            'email' => 'miquel@geganters.cat',
        ]);

        $data = (new UserResource($user))->toArray(Request::create('/'));

        $this->assertSame(['id', 'name', 'email', 'created_at', 'updated_at'], array_keys($data));
        $this->assertSame(7, $data['id']);
        $this->assertSame('Miquel Pons', $data['name']);
        $this->assertSame('miquel@geganters.cat', $data['email']);
    }

    public function test_it_returns_null_dates_when_user_is_not_persisted(): void {
        $user = new User;
        $user->name = 'New User';
        $user->email = 'new@geganters.cat';

        $data = (new UserResource($user))->toArray(Request::create('/'));

        $this->assertNull($data['created_at']);
        $this->assertNull($data['updated_at']);
    }
}
