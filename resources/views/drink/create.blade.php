@extends('layouts.app', [
    'class' => '',
    'elementActive' => 'drinks'
])

@section('content')
<div class="content">
        @if (session('status'))
            <div class="alert alert-success" role="alert">
                {{ session('status') }}
            </div>
        @endif
            <div class="row">
                <form class="col-md-12" action="{{ route('drink.store') }}" method="POST">
                    @csrf
                    <div class="card">
                        <div class="card-header">
                            <h5 class="title">{{ __('Nouvelle boisson') }}</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <label class="col-md-3 col-form-label">{{ __('Nom de la boisson') }}</label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" name="name" class="form-control" placeholder="" required>
                                    </div>
                                    @if ($errors->has('name'))
                                        <span class="invalid-feedback" style="display: block;" role="alert">
                                            <strong>{{ $errors->first('name') }}</strong>
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div class="row">
                                <label class="col-md-3 col-form-label" for="drink-group">{{ __('Groupe de boisson') }}</label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <select multiple class="form-control" name="group_id" id="drink-group" required>
                                            @foreach ($groups as $group)
                                            <option value="{{ $group->id }}">{{ $group->name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col-md-12 text-center">
                                    <button type="submit" class="btn btn-info btn-round">{{ __('Ajouter') }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
</div>
@endsection
