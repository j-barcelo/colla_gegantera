<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description', 'type'])]
class Role extends Model {
    use HasFactory;

    public const string ADMIN_NAME = 'Administració';
    public const string ADMIN_SLUG = 'administracio';
    public const string DEFAULT_MEMBER_ROLE = 'Portadors';

    /**
     * Users assigned to this role.
     *
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class);
    }
}
