import { computed, Ref, ref, toRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export interface useCycleListConfig {
  fallbackIndex?: number;
  fallbackValue?: any;
}

export const useCycleListConfigDefaults: useCycleListConfig = {
  fallbackIndex: undefined,
  fallbackValue: undefined,
}

export const useCycleList = <T>(list: MaybeRefOrGetter<T[]>, config?: useCycleListConfig) => {
  const _config =  {
    ...useCycleListConfigDefaults,
    ...config
  }
  const activeIndex = ref(0)
  const _list = toRef(list) as Ref<T[]>

  return {
    state: computed({
      get() {
        return _list.value[activeIndex.value]
      },
      set(value) {
        const foundItem = _list.value.find(item => item === value)
        if (foundItem >= 0) {
          activeIndex.value = foundItem
        } else {
          const foundFallbackValueIndex = _list.value.indexOf(_config.fallbackValue)

          if (foundFallbackValueIndex === -1) {
            throw Error(
              `${value} is not found in the useCycleList list and cannot be set with state.value = ''`
            )
          } else {
            activeIndex.value = foundFallbackValueIndex
          }
        }
      }
    }),
    next: () => {
      if (activeIndex.value === _list.value.length - 1) {
        activeIndex.value = 0
      } else {
        activeIndex.value++
      }
    },
    prev: () => {
      if (activeIndex.value === 0) {
        activeIndex.value = _list.value.length - 1
      } else {
        activeIndex.value--
      }
    },
    go: (index: number) => {
      if (index >= _list.value.length) {
        if (typeof _config.fallbackIndex === 'undefined') {
          activeIndex.value = _config.fallbackIndex
        } else {
          throw Error(
            `Cannot fo to index ${index}. The list provided to useCycleList is not that long.`
          )
        }
      } else {
        activeIndex.value = index
      }
    },
  }
}
