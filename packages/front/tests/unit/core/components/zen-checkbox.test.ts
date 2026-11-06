import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import ZenCheckbox from '@/core/components/ui/ZenCheckbox.vue';

describe('ZenCheckbox', () => {
  it('updates v-model through its label and follows external model changes', async () => {
    const checked = ref(false);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ZenCheckbox, {
            modelValue: checked.value,
            'onUpdate:modelValue': (value: boolean) => {
              checked.value = value;
            },
            label: 'Found books only',
          }),
      }),
      { attachTo: document.body },
    );
    try {
      await wrapper.get('label').trigger('click');
      expect(checked.value).toBeTruthy();
      expect(
        wrapper.get<HTMLInputElement>('input').element.checked,
      ).toBeTruthy();
      checked.value = false;
      await wrapper.vm.$nextTick();
      expect(
        wrapper.get<HTMLInputElement>('input').element.checked,
      ).toBeFalsy();
    } finally {
      wrapper.unmount();
    }
  });

  it('does not toggle a disabled control when the label or input is clicked', async () => {
    const wrapper = mount(ZenCheckbox, {
      props: { disabled: true, label: 'Found books only' },
      attachTo: document.body,
    });
    try {
      wrapper.get<HTMLInputElement>('input').element.click();
      await wrapper.get('label').trigger('click');
      expect(
        wrapper.get<HTMLInputElement>('input').element.checked,
      ).toBeFalsy();
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });

  it('participates in native form submission with the supplied name and value', async () => {
    const checked = ref(false);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('form', {}, [
            h(
              ZenCheckbox,
              {
                modelValue: checked.value,
                'onUpdate:modelValue': (value: boolean) => {
                  checked.value = value;
                },
                name: 'foundOnly',
                value: 'yes',
                required: true,
              },
              { default: () => 'Found books only' },
            ),
          ]),
      }),
      { attachTo: document.body },
    );
    try {
      const form = wrapper.get('form').element as HTMLFormElement;
      expect(form.checkValidity()).toBeFalsy();
      expect(new FormData(form).has('foundOnly')).toBeFalsy();
      await wrapper.get('input').setValue(true);
      expect(form.checkValidity()).toBeTruthy();
      expect(new FormData(form).get('foundOnly')).toBe('yes');
    } finally {
      wrapper.unmount();
    }
  });

  it('gives repeated instances independent native labels without a supplied id', () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('div', {}, [
            h(ZenCheckbox, { label: 'First collection' }),
            h(ZenCheckbox, {}, { default: () => 'Second collection' }),
          ]),
      }),
    );
    try {
      const inputs = wrapper.findAll<HTMLInputElement>('input');
      expect(inputs[0].element.id).not.toBe(inputs[1].element.id);
      expect(inputs[0].element.labels?.[0].textContent).toContain(
        'First collection',
      );
      expect(inputs[1].element.labels?.[0].textContent).toContain(
        'Second collection',
      );
    } finally {
      wrapper.unmount();
    }
  });
});
