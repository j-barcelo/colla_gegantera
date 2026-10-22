<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue?: string;
  id: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  label?: string;
  autocomplete?: string;
  disabled?: boolean;
  error?: string;
  validator?: (value: string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  type: 'text',
  placeholder: '',
  label: '',
  autocomplete: undefined,
  disabled: false,
  error: '',
  validator: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:error', value: string): void;
}>();

const showPassword = ref(false);
const isTouched = ref(false);
const internalError = ref('');

const isPassword = computed(() => props.type === 'password');
const resolvedType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type));
const displayError = computed(() => props.error || internalError.value);
const resolvedAutocomplete = computed(() => {
  if (props.autocomplete) return props.autocomplete;
  const fieldName = props.name || props.id;
  if (fieldName === 'name') return 'given-name';
  if (fieldName === 'surname') return 'family-name';
  if (fieldName === 'address') return 'street-address';
  return undefined;
});

const validate = (valueToValidate = props.modelValue): boolean => {
  isTouched.value = true;

  if (!props.validator) {
    internalError.value = '';
    return true;
  }

  const validationMsg = props.validator(valueToValidate);
  internalError.value = validationMsg;
  return !validationMsg;
};

const onBlur = (): void => {
  validate();
};

const onInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const newValue = target.value;

  emit('update:modelValue', newValue);
  if (props.error) emit('update:error', '');
  if (isTouched.value || internalError.value) validate(newValue);
};

const validateIfTouched = (): void => {
  if (isTouched.value || internalError.value) validate();
};

defineExpose({
  validate,
  validateIfTouched,
});
</script>

<template>
  <div class="c-input" :class="{ 'c-input--error': !!displayError }">
    <label :for="id" class="u-visually-hidden">{{ label || placeholder }}</label>
    <span v-if="displayError" class="c-input__error">{{ displayError }}</span>
    <div class="c-input__row">
      <input
        :id="id"
        :value="modelValue"
        :type="resolvedType"
        :name="name || id"
        :autocomplete="resolvedAutocomplete"
        :placeholder="placeholder"
        class="c-input__control"
        :disabled="disabled"
        @blur="onBlur"
        @input="onInput"
      />
      <button
        v-if="isPassword"
        type="button"
        class="c-input__toggle-pw"
        :aria-label="showPassword ? 'Amaga la contrasenya' : 'Mostra la contrasenya'"
        @click="showPassword = !showPassword"
      >
        <svg v-if="showPassword" class="c-input__icon" viewBox="0 0 512 512" aria-hidden="true">
          <path
            d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-17.47C428.89 172.28 347.8 112 255.66 112Z"
          />
          <circle cx="256" cy="256" r="80" />
          <line x1="80" y1="80" x2="432" y2="432" />
        </svg>
        <svg v-else class="c-input__icon" viewBox="0 0 512 512" aria-hidden="true">
          <path
            d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-17.47C428.89 172.28 347.8 112 255.66 112Z"
          />
          <circle cx="256" cy="256" r="80" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" src="./AppInput.scss"></style>
