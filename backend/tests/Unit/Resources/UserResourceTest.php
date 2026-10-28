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
            'name' => 'Miquel',
            'surname' => 'Pons',
            'username' => 'mpons',
            'email' => 'miquel@geganters.cat',
            'phone' => '600123456',
            'role' => 'member',
            'address' => 'Carrer Major 1',
            'avatar' => 'avatars/miquel.jpg',
        ]);

        $data = (new UserResource($user))->toArray(Request::create('/'));

        $this->assertSame(['id', 'name', 'surname', 'username', 'email',
            'role', 'phone', 'address', 'avatar', 'created_at', 'updated_at',
        ], array_keys($data));
        $this->assertSame(7, $data['id']);
        $this->assertSame('Miquel', $data['name']);
        $this->assertSame('Pons', $data['surname']);
        $this->assertSame('mpons', $data['username']);
        $this->assertSame('miquel@geganters.cat', $data['email']);
        $this->assertSame('member', $data['role']);
        $this->assertSame('600123456', $data['phone']);
        $this->assertSame('Carrer Major 1', $data['address']);
        $this->assertSame('avatars/miquel.jpg', $data['avatar']);
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
