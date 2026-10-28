<?php

namespace Web\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InstallRequest extends FormRequest {
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array {
        $requiresServerCredentials = Rule::requiredIf(
            fn (): bool => in_array($this->input('db_connection'), ['mysql', 'pgsql'], true),
        );

        return [
            'db_connection' => ['required', 'string', Rule::in(['sqlite', 'mysql', 'pgsql'])],
            'db_host' => ['nullable', $requiresServerCredentials, 'string', 'max:255'],
            'db_port' => ['nullable', $requiresServerCredentials, 'integer', 'min:1', 'max:65535'],
            'db_database' => ['nullable', $requiresServerCredentials, 'string', 'max:255'],
            'db_username' => ['nullable', $requiresServerCredentials, 'string', 'max:255'],
            'db_password' => ['nullable', 'string', 'max:255'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_surname' => ['nullable', 'string', 'max:255'],
            'admin_email' => ['required', 'string', 'email', 'max:255'],
            'admin_password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
