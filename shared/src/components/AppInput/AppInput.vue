<script setup lang="ts">
import { materialPaths } from '../../icons';
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
        <svg v-if="showPassword" class="c-input__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="materialPaths.visibilityOff" />
        </svg>
        <svg v-else class="c-input__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="materialPaths.visibility" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" src="./AppInput.scss"></style>
