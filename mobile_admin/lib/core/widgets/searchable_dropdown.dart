import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Drop-in replacement for DropdownButtonFormField: same look as the other form
/// fields, but tapping opens a bottom sheet with a search box.
/// Item labels are read from the items' Text children.
class SearchableDropdown<T> extends StatelessWidget {
  final T? _value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?>? onChanged;
  final InputDecoration decoration;
  final Widget? hint;
  final bool isExpanded; // accepted for API compatibility; the field always fills its width
  final String? Function(T?)? validator;

  const SearchableDropdown({
    super.key,
    T? value,
    T? initialValue, // DropdownButtonFormField's newer name for the same thing
    required this.items,
    required this.onChanged,
    this.decoration = const InputDecoration(),
    this.hint,
    this.isExpanded = true,
    this.validator,
  }) : _value = value ?? initialValue;

  T? get value => _value;

  static String _labelOf(Widget? w) {
    if (w is Text) return w.data ?? w.textSpan?.toPlainText() ?? '';
    return '';
  }

  DropdownMenuItem<T>? get _selected {
    for (final i in items) {
      if (i.value == value) return i;
    }
    return null;
  }

  Future<void> _open(BuildContext context) async {
    final picked = await showModalBottomSheet<DropdownMenuItem<T>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _PickerSheet<T>(items: items, selected: value, title: decoration.labelText),
    );
    if (picked != null) onChanged?.call(picked.value);
  }

  @override
  Widget build(BuildContext context) {
    final sel = _selected;
    final label = sel != null ? _labelOf(sel.child) : '';
    final hintText = hint is Text ? _labelOf(hint) : decoration.hintText;
    final enabled = onChanged != null;
    final field = FormField<T>(
      initialValue: value,
      validator: validator == null ? null : (_) => validator!(value),
      builder: (state) => InkWell(
        onTap: enabled ? () => _open(context) : null,
        borderRadius: BorderRadius.circular(8),
        child: InputDecorator(
          isEmpty: label.isEmpty,
          decoration: decoration.copyWith(
            hintText: hintText,
            errorText: decoration.errorText ?? state.errorText,
            suffixIcon: const Icon(Icons.arrow_drop_down),
          ),
          child: Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(color: enabled ? null : AppColors.textMuted)),
        ),
      ),
    );
    // Rebuild the FormField when the value changes so it never shows a stale selection
    return KeyedSubtree(key: ValueKey(value), child: field);
  }
}

class _PickerSheet<T> extends StatefulWidget {
  final List<DropdownMenuItem<T>> items;
  final T? selected;
  final String? title;
  const _PickerSheet({required this.items, required this.selected, this.title});
  @override State<_PickerSheet<T>> createState() => _PickerSheetState<T>();
}

class _PickerSheetState<T> extends State<_PickerSheet<T>> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.items
        .where((i) => SearchableDropdown._labelOf(i.child).toLowerCase().contains(_q.toLowerCase()))
        .toList();
    final h = MediaQuery.of(context).size.height;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: h * 0.7,
        child: Column(children: [
          const SizedBox(height: 8),
          Container(width: 36, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          if (widget.title != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(widget.title!, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700))),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              autofocus: true,
              decoration: const InputDecoration(hintText: 'Search…', prefixIcon: Icon(Icons.search, size: 20), isDense: true),
              onChanged: (v) => setState(() => _q = v),
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? const Center(child: Text('No options found', style: TextStyle(color: AppColors.textMuted)))
                : ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (_, i) {
                      final item = filtered[i];
                      final isSel = item.value == widget.selected;
                      return ListTile(
                        dense: true,
                        title: Text(SearchableDropdown._labelOf(item.child), style: TextStyle(fontWeight: isSel ? FontWeight.w700 : FontWeight.w400, color: isSel ? AppColors.primary : null)),
                        trailing: isSel ? const Icon(Icons.check, size: 18, color: AppColors.primary) : null,
                        onTap: () => Navigator.pop(context, item),
                      );
                    },
                  ),
          ),
        ]),
      ),
    );
  }
}
